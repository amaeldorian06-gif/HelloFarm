import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Zap, ShieldCheck, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface AIPredictorProps {
  active?: boolean;
}

const AIPredictor = memo(({ active = false }: AIPredictorProps) => {
  const [isScanning, setIsScanning] = useState(active);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setIsScanning(active);
  }, [active]);

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 0 : prev + 1));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  return (
    <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
      {/* Laser Scan Animation */}
      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ top: '0%' }}
            animate={{ top: '100%' }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-farm-accent to-transparent z-20 shadow-[0_0_15px_rgba(242,125,38,0.8)]"
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
        <div className="w-32 h-32 rounded-full border-2 border-dashed border-farm-accent/30 flex items-center justify-center relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-t-2 border-farm-accent"
          />
          <BrainCircuit size={48} className="text-farm-accent" />
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
            <span className="px-2 py-0.5 rounded bg-farm-accent/20 text-farm-accent text-[10px] font-bold uppercase tracking-tighter">AI Engine v2.4</span>
            <span className="flex items-center gap-1 text-[10px] text-green-400 font-medium">
              <Zap size={10} /> Temps Réel
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Diagnostic de Culture</h2>
          <p className="text-sm text-white/60 max-w-md">
            Analyse multispectrale en cours sur la parcelle <span className="text-white font-mono">#CMR-42-MAIZE</span>. 
            Détection précoce des parasites et optimisation hydrique.
          </p>
        </div>

        <div className="w-full md:w-48 space-y-3">
          <PredictionItem icon={<ShieldCheck size={14} className="text-green-400" />} label="Santé" value="94%" color="bg-green-400" />
          <PredictionItem icon={<AlertCircle size={14} className="text-orange-400" />} label="Risque Mildiou" value="12%" color="bg-orange-400" />
          <div className="pt-2">
            <button 
              onClick={() => setIsScanning(!isScanning)}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all border border-white/10"
            >
              {isScanning ? "ARRÊTER LE SCAN" : "LANCER L'ANALYSE"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

const PredictionItem = memo(({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider opacity-60">
        <div className="flex items-center gap-1">{icon} {label}</div>
        <span>{value}</span>
      </div>
      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: value }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full", color)}
        />
      </div>
    </div>
  );
});

export default AIPredictor;
