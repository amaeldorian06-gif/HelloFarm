import React, { useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import Layout from './components/Layout';
import DashboardCard from './components/DashboardCard';
import Reveal from './components/Reveal';

// Lazy load heavy components
import AIPredictor from './components/AIPredictor';
import Marketplace from './components/Marketplace';
import AIAdvisor from './components/AIAdvisor';
import DroneDetails from './components/DroneDetails';
import DroneMonitor from './components/DroneMonitor';
import { 
  Droplets, 
  Thermometer, 
  Wind, 
  CloudRain,
  ArrowUpRight,
  Bell,
  LogIn,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { AppSection, UserPreferences, IoTData, AppNotification, DroneReport, UserProfile } from './types';
import { supabase } from './supabase';

// --- Error Handling Spec for Supabase ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface SupabaseErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
  }
}

function handleSupabaseError(error: any, operationType: OperationType, path: string | null) {
  const errInfo: SupabaseErrorInfo = {
    error: error?.message || String(error),
    authInfo: {
      userId: undefined, // Will be filled if needed
      email: undefined,
    },
    operationType,
    path
  };
  console.error('Supabase Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Error Boundary Component ---
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorInfo: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error: any) {
    try {
      const info = JSON.parse(error.message);
      return { hasError: true, errorInfo: info };
    } catch {
      return { hasError: true, errorInfo: { error: error.message || 'An unexpected error occurred' } };
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
          <div className="glass-panel p-8 rounded-[2.5rem] max-w-md w-full space-y-6 border border-red-500/20">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black tracking-tighter">Erreur de Connexion</h2>
              <p className="text-white/60 text-sm">
                {this.state.errorInfo.error?.includes('offline') 
                  ? "Impossible de contacter le serveur. Vérifiez votre configuration Supabase ou réessayez plus tard."
                  : "Une erreur est survenue lors de l'accès aux données."}
              </p>
            </div>
            <div className="bg-black/40 p-4 rounded-2xl text-[10px] font-mono text-white/40 overflow-auto max-h-40">
              <pre>{JSON.stringify(this.state.errorInfo, null, 2)}</pre>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold transition-all"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Wrap App with ErrorBoundary
export default function Root() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

function App() {
  const [activeSection, setActiveSection] = useState<AppSection>('analyse');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [iotData, setIotData] = useState<IoTData | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [droneReports, setDroneReports] = useState<DroneReport[]>([]);
  const [isAiActive, setIsAiActive] = useState(false);

  const [preferences, setPreferences] = useState<UserPreferences>({
    language: 'fr',
    accentColor: '#F27D26',
    notifications: {
      pestAlerts: true,
      marketOrders: true,
      weatherAdvisories: true,
    }
  });

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const hasUnread = useMemo(() => notifications.some(n => !n.read), [notifications]);

  // Auth Listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('uid', session.user.id)
          .single();

        if (userData) {
          setUser(userData);
          setPreferences(userData.preferences);
        } else {
          // Create new user profile
          const newProfile: UserProfile = {
            uid: session.user.id,
            displayName: session.user.user_metadata.full_name || 'Agriculteur',
            email: session.user.email || '',
            role: 'producer',
            preferences: { 
              language: 'fr', 
              accentColor: '#F27D26',
              notifications: {
                pestAlerts: true,
                marketOrders: true,
                weatherAdvisories: true,
              }
            }
          };
          const { error: insertError } = await supabase.from('users').insert([newProfile]);
          if (insertError) console.error('Error creating profile:', insertError);
          setUser(newProfile);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Supabase Listeners
  useEffect(() => {
    if (!user) return;

    // IoT Data (Initial fetch + Real-time)
    const fetchIot = async () => {
      const { data, error } = await supabase
        .from('iot_data')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1);
      if (data && data.length > 0) setIotData(data[0]);
    };
    fetchIot();

    const iotChannel = supabase
      .channel('iot_data_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'iot_data' }, payload => {
        setIotData(payload.new as IoTData);
      })
      .subscribe();

    // Notifications
    const fetchNotifs = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('userId', user.uid)
        .order('timestamp', { ascending: false })
        .limit(10);
      if (data) setNotifications(data);
    };
    fetchNotifs();

    const notifChannel = supabase
      .channel(`notif_changes:${user.uid}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications',
        filter: `userId=eq.${user.uid}`
      }, () => {
        fetchNotifs();
      })
      .subscribe();

    // Drone Reports
    const fetchReports = async () => {
      const { data } = await supabase
        .from('drone_reports')
        .select('*')
        .eq('userId', user.uid)
        .order('timestamp', { ascending: false })
        .limit(5);
      if (data) setDroneReports(data);
    };
    fetchReports();

    const reportChannel = supabase
      .channel(`report_changes:${user.uid}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'drone_reports',
        filter: `userId=eq.${user.uid}`
      }, () => {
        fetchReports();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(iotChannel);
      supabase.removeChannel(notifChannel);
      supabase.removeChannel(reportChannel);
    };
  }, [user]);

  // Apply accent color to CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--color-farm-accent', preferences.accentColor);
  }, [preferences.accentColor]);

  const handleUpdatePreferences = useCallback(async (newPrefs: Partial<UserPreferences>) => {
    const updatedPrefs = { ...preferences, ...newPrefs };
    setPreferences(updatedPrefs);
    if (user) {
      await supabase
        .from('users')
        .update({ preferences: updatedPrefs })
        .eq('uid', user.uid);
    }
  }, [preferences, user]);

  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = useCallback(async () => {
    setLoginError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Login failed", error);
      setLoginError("Échec de la connexion. Veuillez réessayer.");
    }
  }, []);

  const handleLogout = useCallback(() => supabase.auth.signOut(), []);

  const toggleAi = useCallback(() => setIsAiActive(prev => !prev), []);

  // Notification Permission (Supabase doesn't have built-in FCM, but we can keep the logic for browser notifications)
  useEffect(() => {
    if (!user) return;

    const requestPermission = async () => {
      try {
        if ("Notification" in window) {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            console.log('Notification permission granted');
          }
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    };

    requestPermission();
  }, [user]);

  const handleBypassLogin = useCallback(() => {
    setLoading(true);
    // Simulate network delay
    setTimeout(() => {
      const mockUser: UserProfile = {
        uid: 'mock-user-123',
        displayName: 'Invité (Mode Démo)',
        email: 'demo@hellofarm.com',
        role: 'producer',
        preferences: {
          language: 'fr',
          accentColor: '#F27D26',
          notifications: { pestAlerts: true, marketOrders: true, weatherAdvisories: true }
        }
      };
      setUser(mockUser);
      
      // Provide some mock data
      setIotData({
        zoneId: 'ZONE-A1',
        temperature: 24.5,
        humidity: 68,
        windSpeed: 12.5,
        precipitation: 0.2,
        timestamp: new Date().toISOString()
      });
      
      setNotifications([
        {
          id: 'n1',
          userId: 'mock-user-123',
          message: 'L\'humidité du sol est faible dans le secteur A.',
          type: 'warning',
          read: false,
          timestamp: new Date().toISOString()
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-farm-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 font-bold tracking-widest animate-pulse">HELLO FARM INITIALISATION...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-40 grayscale"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=1920)' }}
        />
        <div className="relative z-10 glass-panel p-12 rounded-[3rem] max-w-md w-full text-center space-y-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter text-farm-accent">HELLO FARM</h1>
            <p className="text-white/60 font-medium">L'agriculture de précision au Cameroun.</p>
          </div>
          <div className="space-y-4">
            <button 
              onClick={handleLogin}
              className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold flex items-center justify-center gap-3 border border-white/10 transition-all"
            >
              <LogIn size={20} />
              Se connecter avec Google
            </button>
            <button 
              onClick={handleBypassLogin}
              className="w-full py-4 rounded-2xl bg-farm-accent text-white font-bold flex items-center justify-center gap-3 shadow-2xl shadow-farm-accent/40 hover:scale-105 transition-all"
            >
              <Sparkles size={20} />
              Continuer sans compte (Mode Démo)
            </button>
          </div>
          {loginError && (
            <p className="text-red-400 text-xs font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20">
              {loginError}
            </p>
          )}
          <p className="text-[10px] text-white/30 uppercase tracking-widest">Accès sécurisé via Supabase Auth</p>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      activeSection={activeSection} 
      onSectionChange={setActiveSection}
      preferences={preferences}
      onUpdatePreferences={handleUpdatePreferences}
      onLogout={handleLogout}
      onToggleAi={toggleAi}
      isAiActive={isAiActive}
      user={user}
    >
      <div className="space-y-12 max-w-7xl mx-auto">
        {activeSection === 'analyse' && (
          <>
            {/* Welcome Section */}
            <Reveal direction="right">
              <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
                    {preferences.language === 'fr' ? 'Bonjour,' : 'Hello,'} <span className="text-farm-accent">{user.displayName}</span>
                  </h1>
                  <p className="text-white/60 font-medium">
                    {preferences.language === 'fr' 
                      ? `Vos drones sont en patrouille. ${unreadCount} alertes nécessitent votre attention.` 
                      : `Your drones are on patrol. ${unreadCount} alerts require your attention.`}
                  </p>
                </div>
                <Reveal direction="left" delay={0.2}>
                  <div className="flex gap-3">
                    <button className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm hover:bg-white/20 transition-all relative">
                      <Bell size={18} className="text-farm-accent" />
                      Notifications
                      {hasUnread && (
                        <span className="w-5 h-5 rounded-full bg-red-500 text-[10px] flex items-center justify-center absolute -top-2 -right-2">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <button className="bg-farm-accent px-6 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm shadow-xl shadow-farm-accent/30 hover:scale-105 transition-all">
                      {preferences.language === 'fr' ? 'Rapport Drone' : 'Drone Report'}
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                </Reveal>
              </section>
            </Reveal>

            {/* IoT Stats Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Reveal delay={0.1} direction="right">
                <DashboardCard 
                  label={preferences.language === 'fr' ? "Humidité du Sol" : "Soil Moisture"}
                  value={iotData?.humidity || 42} 
                  unit="%" 
                  icon={<Droplets size={24} />} 
                  trend="up"
                  description={preferences.language === 'fr' ? "Données satellites temps réel." : "Real-time satellite data."}
                />
              </Reveal>
              <Reveal delay={0.2} direction="down">
                <DashboardCard 
                  label={preferences.language === 'fr' ? "Température" : "Temperature"}
                  value={iotData?.temperature || 28.4} 
                  unit="°C" 
                  icon={<Thermometer size={24} />} 
                  trend="stable"
                  description={preferences.language === 'fr' ? "Capteurs LoRaWAN actifs." : "LoRaWAN sensors active."}
                />
              </Reveal>
              <Reveal delay={0.3} direction="up">
                <DashboardCard 
                  label={preferences.language === 'fr' ? "Vitesse Vent" : "Wind Speed"}
                  value={iotData?.windSpeed || 12} 
                  unit="km/h" 
                  icon={<Wind size={24} />} 
                  trend="down"
                  description={preferences.language === 'fr' ? "Zone: " + (iotData?.zoneId || "CMR-42") : "Zone: " + (iotData?.zoneId || "CMR-42")}
                />
              </Reveal>
              <Reveal delay={0.4} direction="left">
                <DashboardCard 
                  label={preferences.language === 'fr' ? "Précipitations" : "Precipitation"}
                  value={iotData?.precipitation || 5} 
                  unit="mm" 
                  icon={<CloudRain size={24} />} 
                  trend="up"
                  description={preferences.language === 'fr' ? "Prévisions IA farm.ai" : "farm.ai AI Forecast"}
                />
              </Reveal>
            </section>

            {/* AI Predictor Widget */}
            <Reveal direction="up" delay={0.5}>
              <section>
                <AIPredictor active={isAiActive} />
              </section>
            </Reveal>
          </>
        )}

        {activeSection === 'marche' && (
          <Reveal direction="up">
            <section>
              <Marketplace />
            </section>
          </Reveal>
        )}

        {activeSection === 'ai' && (
          <Reveal direction="up">
            <section>
              <AIAdvisor />
            </section>
          </Reveal>
        )}
        
        {activeSection === 'drone' && (
          <Reveal direction="up">
            <section>
              <DroneDetails />
            </section>
          </Reveal>
        )}

        {activeSection === 'monitor' && (
          <Reveal direction="up">
            <section>
              <DroneMonitor />
            </section>
          </Reveal>
        )}

        {/* Footer Info (Mobile Money & Offline) */}
        <Reveal direction="up" delay={0.6}>
          <footer className="pt-12 pb-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
            <div className="text-[10px] uppercase tracking-[0.3em] font-bold">
              © 2026 Hello Farm Cameroon • Powered by LoRaWAN & AI
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-[10px] font-bold uppercase">
                  {preferences.language === 'fr' ? 'Serveur Douala-1 Actif' : 'Douala-1 Server Active'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-farm-accent" />
                <span className="text-[10px] font-bold uppercase">
                  {preferences.language === 'fr' ? 'Paiements Sécurisés' : 'Secure Payments'}
                </span>
              </div>
            </div>
          </footer>
        </Reveal>
      </div>
    </Layout>
  );
}
