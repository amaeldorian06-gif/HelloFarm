import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Palette, Check, Bell, ShieldAlert, ShoppingCart, CloudSun } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserPreferences } from '../types';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdate: (prefs: Partial<UserPreferences>) => void;
}

const COLORS = [
  { name: 'Orange (MTN/Orange)', value: '#F27D26' },
  { name: 'Vert Forêt', value: '#2D5A27' },
  { name: 'Bleu Indigo', value: '#4F46E5' },
  { name: 'Rouge Crimson', value: '#DC2626' },
];

export default function PreferencesModal({ isOpen, onClose, preferences, onUpdate }: PreferencesModalProps) {
  const toggleNotification = (key: keyof UserPreferences['notifications']) => {
    onUpdate({
      notifications: {
        ...preferences.notifications,
        [key]: !preferences.notifications[key]
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl border-white/20 my-8"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Préférences</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-8">
              {/* Language Selection */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-white/60">
                  <Globe size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Langue</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onUpdate({ language: 'fr' })}
                    className={cn(
                      "px-4 py-3 rounded-2xl border transition-all font-medium",
                      preferences.language === 'fr' 
                        ? "bg-farm-accent border-farm-accent text-white" 
                        : "bg-white/5 border-white/10 text-white/60 hover:border-white/30"
                    )}
                  >
                    Français
                  </button>
                  <button
                    onClick={() => onUpdate({ language: 'en' })}
                    className={cn(
                      "px-4 py-3 rounded-2xl border transition-all font-medium",
                      preferences.language === 'en' 
                        ? "bg-farm-accent border-farm-accent text-white" 
                        : "bg-white/5 border-white/10 text-white/60 hover:border-white/30"
                    )}
                  >
                    English
                  </button>
                </div>
              </section>

              {/* Notification Settings */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-white/60">
                  <Bell size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Notifications Push</span>
                </div>
                <div className="space-y-3">
                  <NotificationToggle 
                    icon={<ShieldAlert size={16} />}
                    label="Alertes Ravageurs (IA)"
                    active={preferences.notifications?.pestAlerts}
                    onToggle={() => toggleNotification('pestAlerts')}
                  />
                  <NotificationToggle 
                    icon={<ShoppingCart size={16} />}
                    label="Nouvelles Commandes"
                    active={preferences.notifications?.marketOrders}
                    onToggle={() => toggleNotification('marketOrders')}
                  />
                  <NotificationToggle 
                    icon={<CloudSun size={16} />}
                    label="Alertes Météo"
                    active={preferences.notifications?.weatherAdvisories}
                    onToggle={() => toggleNotification('weatherAdvisories')}
                  />
                </div>
              </section>

              {/* Color Selection */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-white/60">
                  <Palette size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Couleur d'accent</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => onUpdate({ accentColor: color.value })}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left",
                        preferences.accentColor === color.value 
                          ? "bg-white/10 border-white/40" 
                          : "bg-white/5 border-white/10 opacity-60 hover:opacity-100"
                      )}
                    >
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="text-xs font-medium truncate">{color.name}</span>
                      {preferences.accentColor === color.value && <Check size={14} className="ml-auto text-farm-accent" />}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <div className="mt-10">
              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-farm-accent text-white font-bold shadow-lg shadow-farm-accent/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Enregistrer les modifications
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function NotificationToggle({ icon, label, active, onToggle }: { icon: React.ReactNode, label: string, active: boolean, onToggle: () => void }) {
  return (
    <button 
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="text-white/40">{icon}</div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className={cn(
        "w-10 h-5 rounded-full relative transition-all duration-300",
        active ? "bg-farm-accent" : "bg-white/10"
      )}>
        <div className={cn(
          "absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300",
          active ? "left-6" : "left-1"
        )} />
      </div>
    </button>
  );
}
