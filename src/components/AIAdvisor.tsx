import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, TrendingUp, CloudSun, AlertCircle, ChevronRight, MessageSquare, Send } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { supabase } from '../supabase';
import { UserPreferences } from '../types';
import Reveal from './Reveal';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface Advice {
  id: string;
  content: string;
  type: 'health' | 'market' | 'weather';
  timestamp: string;
}

export default function AIAdvisor() {
  const [advices, setAdvices] = useState<Advice[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInput, setUserInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [expandedAdvices, setExpandedAdvices] = useState<Set<string>>(new Set());
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  const toggleExpand = useCallback((id: string) => {
    setExpandedAdvices(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    let adviceChannel: any;

    const setupRealtime = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Fetch user preferences
      const { data: userData } = await supabase
        .from('users')
        .select('preferences')
        .eq('uid', session.user.id)
        .single();
      
      if (userData?.preferences) {
        setPreferences(userData.preferences as UserPreferences);
      }

      // Fetch initial advice
      const { data: adviceData } = await supabase
        .from('ai_advice')
        .select('*')
        .eq('userId', session.user.id)
        .order('timestamp', { ascending: false })
        .limit(5);
      
      if (adviceData) {
        setAdvices(adviceData);
      }
      setLoading(false);

      // Setup Realtime with correct filter
      adviceChannel = supabase
        .channel(`public:ai_advice:${session.user.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'ai_advice',
          filter: `userId=eq.${session.user.id}` 
        }, (payload) => {
          setAdvices(prev => [payload.new as Advice, ...prev].slice(0, 5));
        })
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (adviceChannel) supabase.removeChannel(adviceChannel);
    };
  }, []);

  const triggerNotification = useCallback((title: string, body: string, type: 'pest' | 'market' | 'weather') => {
    if (!preferences?.notifications) return;

    const shouldNotify = 
      (type === 'pest' && preferences.notifications.pestAlerts) ||
      (type === 'market' && preferences.notifications.marketOrders) ||
      (type === 'weather' && preferences.notifications.weatherAdvisories);

    if (shouldNotify && "Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: '/favicon.ico'
      });
    }
  }, [preferences]);

  const generateAdvice = async (prompt?: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const finalPrompt = prompt || "Donne-moi un conseil rapide sur l'état actuel du marché du maïs et du manioc au Cameroun pour cette saison.";
    
    setGenerating(true);
    setUserInput('');

    try {
      const model = "gemini-3-flash-preview";
      const systemInstruction = `Tu es Hello Farm AI, un expert agronome et analyste de marché pour l'Afrique Centrale (Cameroun). 
      Fournis des conseils précis, actionnables et basés sur des données réelles pour les agriculteurs et commerçants.
      Utilise un ton professionnel, encourageant et moderne. 
      Réponds en Markdown. Sois concis mais informatif.
      IMPORTANT: Si tu détectes un risque de peste, de maladie grave ou une alerte météo critique, commence ton message par [URGENT].`;

      const response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
        config: { systemInstruction }
      });

      const content = response.text || "Désolé, je n'ai pas pu générer de conseil pour le moment.";
      const isUrgent = content.includes('[URGENT]');
      const type = finalPrompt.toLowerCase().includes('prix') || finalPrompt.toLowerCase().includes('marché') ? 'market' : 
                   finalPrompt.toLowerCase().includes('météo') || finalPrompt.toLowerCase().includes('climat') ? 'weather' : 'health';

      if (isUrgent) {
        const notificationType = type === 'weather' ? 'weather' : 'pest';
        triggerNotification(
          notificationType === 'weather' ? 'Alerte Météo Critique' : 'Alerte Sanitaire Culture',
          content.replace('[URGENT]', '').slice(0, 100) + '...',
          notificationType as 'pest' | 'market' | 'weather'
        );
      }

      const { error } = await supabase.from('ai_advice').insert([{
        userId: session.user.id,
        content,
        type,
        timestamp: new Date().toISOString()
      }]);
      if (error) throw error;

    } catch (error) {
      console.error("Error generating AI advice:", error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Chat/Advice Area */}
      <div className="lg:col-span-2 space-y-6">
        <Reveal direction="right">
          <div className="glass-panel p-8 rounded-[3rem] space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Brain size={200} />
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-farm-accent/20 flex items-center justify-center text-farm-accent">
                <Sparkles size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black tracking-tighter">Conseiller IA Hello Farm</h2>
                  <span className="px-2 py-0.5 rounded-full bg-farm-accent/10 border border-farm-accent/20 text-[8px] font-black text-farm-accent uppercase tracking-widest">
                    FastAPI Powered
                  </span>
                </div>
                <p className="text-sm text-white/40">Intelligence agronomique en temps réel</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Posez une question sur vos cultures, le climat ou les prix du marché..."
                  className="w-full h-24 md:h-32 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-white/5 border border-white/10 focus:border-farm-accent/50 focus:ring-1 focus:ring-farm-accent/50 outline-none transition-all text-sm resize-none"
                />
                <button
                  onClick={() => generateAdvice(userInput)}
                  disabled={generating || !userInput.trim()}
                  className="absolute bottom-4 right-4 p-4 rounded-2xl bg-farm-accent text-white shadow-xl shadow-farm-accent/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {generating ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {['Prix du Maïs', 'Maladies du Manioc', 'Météo Yaoundé', 'Exportation'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => generateAdvice(`Parle-moi de : ${tag}`)}
                  disabled={generating}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 hover:text-white hover:border-white/30 transition-all disabled:opacity-50"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="space-y-4">
          <h3 className="text-lg font-bold px-4">Historique des Conseils</h3>
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="glass-card p-6 rounded-[2rem] border border-white/5 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 w-1/4 bg-white/5 rounded" />
                      <div className="h-4 w-full bg-white/5 rounded" />
                      <div className="h-4 w-3/4 bg-white/5 rounded" />
                    </div>
                  </div>
                </div>
              ))
            ) : advices.length > 0 ? (
              advices.map((advice, index) => (
                <motion.div
                  key={advice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      advice.type === 'market' ? "bg-blue-500/10 text-blue-500" :
                      advice.type === 'weather' ? "bg-orange-500/10 text-orange-500" :
                      "bg-green-500/10 text-green-500"
                    )}>
                      {advice.type === 'market' ? <TrendingUp size={20} /> :
                       advice.type === 'weather' ? <CloudSun size={20} /> :
                       <AlertCircle size={20} />}
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
                          {advice.type === 'market' ? 'Analyse Marché' :
                           advice.type === 'weather' ? 'Alerte Météo' : 'Santé Cultures'}
                        </span>
                        <span className="text-[10px] text-white/20">
                          {new Date(advice.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="prose prose-invert prose-sm max-w-none text-white/70 leading-relaxed markdown-body">
                        <Markdown>
                          {expandedAdvices.has(advice.id) 
                            ? advice.content 
                            : advice.content.length > 180 
                              ? advice.content.slice(0, 180).trim() + '...' 
                              : advice.content}
                        </Markdown>
                      </div>
                      {advice.content.length > 180 && (
                        <button 
                          onClick={() => toggleExpand(advice.id)}
                          className="text-[10px] font-bold text-farm-accent hover:underline mt-2 flex items-center gap-1"
                        >
                          {expandedAdvices.has(advice.id) ? 'Voir moins' : 'Voir tout le texte'}
                          <ChevronRight size={10} className={cn("transition-transform", expandedAdvices.has(advice.id) && "rotate-90")} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 glass-panel rounded-[2rem] opacity-40">
                <MessageSquare className="mx-auto mb-4" size={32} />
                <p className="text-sm">Aucun conseil généré pour le moment.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sidebar Stats/Quick Info */}
      <div className="space-y-6">
        <Reveal direction="left" delay={0.2}>
          <div className="glass-panel p-6 rounded-[2.5rem] space-y-6">
            <h4 className="font-bold flex items-center gap-2">
              <TrendingUp size={18} className="text-farm-accent" />
              Tendances du Marché
            </h4>
            <div className="space-y-4">
              {[
                { label: 'Maïs', price: '12,500', trend: '+5%', up: true },
                { label: 'Manioc', price: '8,000', trend: '-2%', up: false },
                { label: 'Tomate', price: '15,000', trend: '+12%', up: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-sm font-medium">{item.label}</span>
                  <div className="text-right">
                    <div className="text-sm font-bold">{item.price} <span className="text-[8px] opacity-40">FCFA</span></div>
                    <div className={cn("text-[10px] font-black", item.up ? "text-green-400" : "text-red-400")}>
                      {item.trend}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-all flex items-center justify-center gap-2 group">
              Voir tout le marché
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </Reveal>

        <Reveal direction="left" delay={0.3}>
          <div className="glass-panel p-6 rounded-[2.5rem] bg-farm-accent/10 border-farm-accent/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-farm-accent flex items-center justify-center text-white">
                <CloudSun size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Prévisions Locales</h4>
                <p className="text-[10px] text-white/40">Yaoundé, Centre</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60">Aujourd'hui</span>
                <span className="text-xs font-bold">28°C / 22°C</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-farm-accent w-3/4" />
              </div>
              <p className="text-[10px] text-white/40 italic">"Conditions idéales pour le semis de maïs cette semaine."</p>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
