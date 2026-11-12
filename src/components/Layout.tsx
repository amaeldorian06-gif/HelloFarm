import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Drone, 
  Sparkles,
  Cpu, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Monitor
} from 'lucide-react';
import { cn } from '../lib/utils';
import PreferencesModal from './PreferencesModal';
import { AppSection, UserPreferences, UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeSection: AppSection;
  onSectionChange: (section: AppSection) => void;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  onLogout: () => void;
  onToggleAi: () => void;
  isAiActive: boolean;
  user: UserProfile;
}

export default function Layout({ 
  children, 
  activeSection, 
  onSectionChange,
  preferences,
  onUpdatePreferences,
  onLogout,
  onToggleAi,
  isAiActive,
  user
}: LayoutProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  // Background images based on section
  const backgrounds: Record<string, string> = useMemo(() => ({
    analyse: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=1920",
    marche: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1920",
    ai: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1920",
    drone: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=1920",
    monitor: "https://images.unsplash.com/photo-1506947411487-a56738267384?auto=format&fit=crop&q=80&w=1920",
  }), []);

  const currentBg = useMemo(() => backgrounds[activeSection] || backgrounds.analyse, [activeSection, backgrounds]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden font-sans">
      {/* Immersive Background with Parallax effect */}
      <div 
        className="fixed inset-0 z-0 transition-all duration-1000 ease-in-out scale-105"
        style={{
          backgroundImage: `url(${currentBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.4) saturate(1.2)'
        }}
      />
      
      {/* Overlay for readability */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 z-50 flex-col p-6">
        <div className="glass-panel rounded-3xl h-full flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold tracking-tighter text-farm-accent">HELLO FARM</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-50">Cameroon Tech Agriculture</p>
          </div>
          
          <nav className="flex-1 px-4 space-y-2 mt-8">
            <NavItem 
              icon={<LayoutDashboard size={20} />} 
              label={preferences.language === 'fr' ? "Analyse" : "Analysis"} 
              active={activeSection === 'analyse'} 
              onClick={() => onSectionChange('analyse')}
            />
            <NavItem 
              icon={<ShoppingBag size={20} />} 
              label={preferences.language === 'fr' ? "Marché" : "Market"} 
              active={activeSection === 'marche'} 
              onClick={() => onSectionChange('marche')}
            />
            <NavItem 
              icon={<Drone size={20} />} 
              label={preferences.language === 'fr' ? "Drone Agri-X4" : "Agri-X4 Drone"} 
              active={activeSection === 'drone'} 
              onClick={() => onSectionChange('drone')}
            />
            <NavItem 
              icon={<Monitor size={20} />} 
              label={preferences.language === 'fr' ? "Drone Monitor" : "Drone Monitor"} 
              active={activeSection === 'monitor'} 
              onClick={() => onSectionChange('monitor')}
            />
          </nav>

          <div className="p-6 mt-auto border-t border-white/10 space-y-4">
            <NavItem 
              icon={<Sparkles size={20} />} 
              label={preferences.language === 'fr' ? "Conseil IA Hello Farm" : "Hello Farm AI Advice"} 
              active={activeSection === 'ai'} 
              onClick={() => onSectionChange('ai')}
            />

            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-all"
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">{preferences.language === 'fr' ? "Déconnexion" : "Logout"}</span>
            </button>
            
            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
              <div className="w-10 h-10 rounded-full bg-farm-accent/20 flex items-center justify-center border border-farm-accent/30">
                <User size={20} className="text-farm-accent" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{user.displayName}</p>
                <p className="text-[10px] opacity-50 uppercase tracking-tighter">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 flex justify-between items-center glass-panel border-none rounded-b-2xl">
        <h1 className="text-lg font-bold text-farm-accent">HELLO FARM</h1>
        <div className="flex items-center gap-4">
          <StatusIndicator isOnline={isOnline} isSyncing={isSyncing} />
          <button onClick={() => setIsPreferencesOpen(true)} className="p-2 rounded-full bg-white/10">
            <User size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={cn(
        "relative z-10 min-h-screen pt-20 pb-24 lg:pt-8 lg:pb-8 lg:pl-72 lg:pr-8 px-4",
        "transition-all duration-500"
      )}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeSection}
            initial={{ 
              opacity: 0, 
              x: activeSection === 'analyse' ? -40 : 40,
              filter: 'blur(10px)'
            }}
            animate={{ 
              opacity: 1, 
              x: 0,
              filter: 'blur(0px)'
            }}
            exit={{ 
              opacity: 0, 
              x: activeSection === 'analyse' ? 40 : -40,
              filter: 'blur(10px)'
            }}
            transition={{ 
              duration: 0.5, 
              ease: [0.21, 0.47, 0.32, 0.98]
            }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2">
        <div className="glass-panel rounded-full px-6 py-3 flex justify-between items-center">
          <MobileNavItem 
            icon={<LayoutDashboard size={20} />} 
            label={preferences.language === 'fr' ? "Analyse" : "Analysis"}
            active={activeSection === 'analyse'} 
            onClick={() => onSectionChange('analyse')}
          />
          <MobileNavItem 
            icon={<ShoppingBag size={20} />} 
            label={preferences.language === 'fr' ? "Marché" : "Market"}
            active={activeSection === 'marche'} 
            onClick={() => onSectionChange('marche')}
          />
          <MobileNavItem 
            icon={<Drone size={20} />} 
            label={preferences.language === 'fr' ? "Drone" : "Drone"}
            active={activeSection === 'drone'} 
            onClick={() => onSectionChange('drone')}
          />
          <MobileNavItem 
            icon={<Monitor size={20} />} 
            label={preferences.language === 'fr' ? "Monitor" : "Monitor"}
            active={activeSection === 'monitor'} 
            onClick={() => onSectionChange('monitor')}
          />
          <div className="relative -top-6">
            <button 
              onClick={() => onSectionChange('ai')}
              className={cn(
                "w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white border-4 border-zinc-950 transition-all duration-500",
                activeSection === 'ai' ? "bg-farm-accent scale-110 shadow-farm-accent/60" : "bg-zinc-800 scale-100"
              )}
            >
              <Sparkles size={28} />
            </button>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-bold text-farm-accent uppercase tracking-widest whitespace-nowrap">
              {preferences.language === 'fr' ? "Conseil IA" : "AI Advice"}
            </div>
          </div>
          <MobileNavItem 
            icon={<LogOut size={20} />} 
            label={preferences.language === 'fr' ? "Sortir" : "Exit"}
            active={false} 
            onClick={onLogout} 
          />
        </div>
      </nav>

      <PreferencesModal 
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        preferences={preferences}
        onUpdate={onUpdatePreferences}
      />
    </div>
  );
}

const NavItem = memo(({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
        active ? "bg-farm-accent text-white shadow-lg shadow-farm-accent/20" : "hover:bg-white/5 text-white/60 hover:text-white"
      )}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
});

const MobileNavItem = memo(({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all duration-200",
        active ? "text-farm-accent" : "text-white/40"
      )}
    >
      {icon}
      <span className="text-[8px] font-bold uppercase tracking-tighter">{label}</span>
    </button>
  );
});

const StatusIndicator = memo(({ isOnline, isSyncing }: { isOnline: boolean, isSyncing: boolean }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
        {isSyncing ? (
          <RefreshCw size={12} className="animate-spin text-blue-400" />
        ) : isOnline ? (
          <Wifi size={12} className="text-green-400" />
        ) : (
          <WifiOff size={12} className="text-red-400" />
        )}
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {isSyncing ? "Sync..." : isOnline ? "Online" : "Offline"}
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-farm-accent/10 border border-farm-accent/20">
        <Cpu size={12} className="text-farm-accent" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-farm-accent">
          FastAPI Ready
        </span>
      </div>
    </div>
  );
});
