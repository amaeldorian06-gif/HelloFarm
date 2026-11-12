import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, 
  Battery, 
  Navigation, 
  Video, 
  Wifi, 
  Zap, 
  ShieldCheck, 
  Clock, 
  Activity,
  ChevronRight,
  Settings,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import Reveal from './Reveal';

interface SpecItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  description?: string;
}

const SpecItem = memo(({ icon, label, value, description }: SpecItemProps) => {
  return (
    <div className="flex items-start gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-farm-accent/30 transition-all group">
      <div className="w-12 h-12 rounded-2xl bg-farm-accent/10 flex items-center justify-center text-farm-accent group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="space-y-1">
        <div className="text-[10px] font-black uppercase tracking-widest text-white/40">{label}</div>
        <div className="text-xl font-black tracking-tighter">{value}</div>
        {description && <div className="text-[10px] text-white/20 font-medium">{description}</div>}
      </div>
    </div>
  );
});

const SPECS = [
  { icon: <Cpu size={20} />, label: "Processeur", value: "Neural Core X1", description: "Traitement IA embarqué 15 TOPS" },
  { icon: <Battery size={20} />, label: "Autonomie", value: "45 Minutes", description: "Batterie Li-Po 6S 8000mAh" },
  { icon: <Navigation size={20} />, label: "Portée", value: "15 KM", description: "Liaison OcuSync 4.0 HD" },
  { icon: <Video size={20} />, label: "Capteur", value: "Multispectral", description: "4K RGB + 5 Bandes NDVI" },
  { icon: <Zap size={20} />, label: "Vitesse Max", value: "72 KM/H", description: "Mode Sport activé" },
  { icon: <ShieldCheck size={20} />, label: "Sécurité", value: "Omnidirectionnel", description: "Évitement d'obstacles 360°" },
];

const STATUS_ITEMS = [
  { label: "Altitude", value: "120m", color: "text-blue-400" },
  { label: "Vitesse", value: "12m/s", color: "text-green-400" },
  { label: "Signal", value: "98%", color: "text-farm-accent" },
  { label: "Satellites", value: "24", color: "text-purple-400" },
];

export default function DroneDetails() {
  return (
    <div className="space-y-8">
      {/* Hero Section - Hardware Vibe */}
      <Reveal direction="down">
        <div className="relative glass-panel p-8 md:p-12 rounded-[3rem] overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Navigation size={300} />
          </div>
          
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-farm-accent/10 border border-farm-accent/20 text-[10px] font-black text-farm-accent uppercase tracking-widest">
                <Activity size={12} />
                Système Opérationnel
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                DRONE <span className="text-farm-accent">AGRI-X4</span>
              </h1>
              <p className="text-lg text-white/60 max-w-xl font-medium leading-relaxed">
                Le fleuron de l'agriculture de précision. Équipé de capteurs multispectraux de pointe pour une analyse granulaire de la santé de vos cultures au Cameroun.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {STATUS_ITEMS.map((item) => (
                  <div key={item.label} className="p-4 rounded-2xl bg-black/40 border border-white/5">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{item.label}</div>
                    <div className={cn("text-2xl font-black tracking-tighter", item.color)}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="w-full md:w-1/3 aspect-square relative group">
              <div className="absolute inset-0 bg-farm-accent/20 blur-[100px] rounded-full group-hover:bg-farm-accent/30 transition-all" />
              <img 
                src="https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800" 
                alt="Drone Agri-X4"
                className="relative z-10 w-full h-full object-contain drop-shadow-2xl rotate-12 group-hover:rotate-0 transition-transform duration-700"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Technical Specs */}
        <div className="lg:col-span-2 space-y-6">
          <Reveal direction="right">
            <div className="space-y-6">
              <h2 className="text-2xl font-black tracking-tighter px-4">Caractéristiques Techniques</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SPECS.map((spec, index) => (
                  <Reveal key={spec.label} delay={index * 0.1} direction="right">
                    <SpecItem {...spec} />
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Maintenance Section */}
          <Reveal direction="up" delay={0.4}>
            <div className="glass-panel p-8 rounded-[2.5rem] space-y-6 border-l-4 border-l-farm-accent">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black tracking-tighter flex items-center gap-2">
                  <Settings size={20} className="text-farm-accent" />
                  État de Maintenance
                </h3>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Dernière révision: 12 Mars 2026</span>
              </div>
              
              <div className="space-y-4">
                {[
                  { label: "Moteurs & Hélices", health: 95 },
                  { label: "Capteurs Optiques", health: 100 },
                  { label: "Système de Transmission", health: 88 },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span>{item.label}</span>
                      <span className="text-farm-accent">{item.health}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.health}%` }}
                        className="h-full bg-farm-accent" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Sidebar - Logs & Quick Actions */}
        <div className="space-y-6">
          <Reveal direction="left" delay={0.2}>
            <div className="glass-panel p-6 rounded-[2.5rem] space-y-6">
              <h4 className="font-bold flex items-center gap-2">
                <Clock size={18} className="text-farm-accent" />
                Missions Récentes
              </h4>
              <div className="space-y-4">
                {[
                  { id: "MS-402", date: "Hier, 14:20", area: "Zone Nord-A", status: "Succès" },
                  { id: "MS-401", date: "22 Mars, 09:15", area: "Zone Sud-B", status: "Succès" },
                  { id: "MS-400", date: "20 Mars, 16:45", area: "Périmètre Est", status: "Interrompu" },
                ].map((log) => (
                  <div key={log.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-black tracking-tighter">{log.id}</span>
                      <span className={cn(
                        "text-[8px] font-black uppercase px-2 py-0.5 rounded-full",
                        log.status === "Succès" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {log.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-white/40 font-medium">{log.area} • {log.date}</div>
                  </div>
                ))}
              </div>
              <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-all flex items-center justify-center gap-2 group">
                Historique complet
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </Reveal>

          <Reveal direction="left" delay={0.3}>
            <div className="glass-panel p-6 rounded-[2.5rem] bg-red-500/5 border-red-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500">
                  <AlertCircle size={20} />
                </div>
                <h4 className="font-bold text-sm">Alerte Système</h4>
              </div>
              <p className="text-xs text-white/60 leading-relaxed mb-4">
                Vent fort détecté (45 km/h). Le mode de vol stationnaire automatique est activé pour préserver la stabilité.
              </p>
              <button className="w-full py-3 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-all">
                Rappel d'Urgence
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
