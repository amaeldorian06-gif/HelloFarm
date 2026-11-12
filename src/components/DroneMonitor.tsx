import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Battery, 
  Navigation, 
  Wind, 
  Activity, 
  Camera, 
  Zap, 
  Compass, 
  Signal,
  AlertCircle,
  Crosshair,
  Eye,
  Maximize2
} from 'lucide-react';
import { cn } from '../lib/utils';
import Reveal from './Reveal';

// --- Telemetry Simulation Hook ---
function useDroneTelemetry() {
  const [telemetry, setTelemetry] = useState({
    battery: 85,
    altitude: 120,
    speed: 42,
    status: "Épandage en cours",
    posX: 50,
    posY: 50,
    heading: 45,
    lat: 4.0511,
    lon: 9.7679
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => {
        // Random variations
        const newBattery = Math.max(0, prev.battery - 0.01);
        const newAlt = Math.max(10, prev.altitude + (Math.random() - 0.5) * 2);
        const newSpeed = Math.max(0, prev.speed + (Math.random() - 0.5) * 5);
        
        // Coordinate fluctuations
        const newLat = prev.lat + (Math.random() - 0.5) * 0.0001;
        const newLon = prev.lon + (Math.random() - 0.5) * 0.0001;

        // Move drone in a circle-ish pattern for HUD elements
        const time = Date.now() / 2000;
        const newX = 50 + Math.cos(time) * 30;
        const newY = 50 + Math.sin(time) * 30;
        const newHeading = (Math.atan2(Math.sin(time), Math.cos(time)) * 180 / Math.PI) + 90;

        return {
          battery: Number(newBattery.toFixed(2)),
          altitude: Number(newAlt.toFixed(1)),
          speed: Number(newSpeed.toFixed(1)),
          status: newBattery < 20 ? "Retour à la base" : "Épandage en cours",
          posX: newX,
          posY: newY,
          heading: newHeading,
          lat: Number(newLat.toFixed(6)),
          lon: Number(newLon.toFixed(6))
        };
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return telemetry;
}

const TelemetryCard = memo(({ icon, label, value, unit, colorClass, progress }: { 
  icon: React.ReactNode, 
  label: string, 
  value: string | number, 
  unit: string,
  colorClass: string,
  progress?: number
}) => (
  <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col gap-3 group hover:border-white/20 transition-all">
    <div className="flex justify-between items-center">
      <div className={cn("p-2 rounded-xl bg-white/5", colorClass)}>{icon}</div>
      <div className="text-[10px] font-black uppercase tracking-widest text-white/30">{label}</div>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-black tracking-tighter">{value}</span>
      <span className="text-[10px] font-bold text-white/40 uppercase">{unit}</span>
    </div>
    {progress !== undefined && (
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={false}
          animate={{ width: `${progress}%` }}
          className={cn("h-full", colorClass.replace('text-', 'bg-'))}
        />
      </div>
    )}
  </div>
));

export default function DroneMonitor() {
  const telemetry = useDroneTelemetry();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <Reveal direction="down">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
              DRONE <span className="text-farm-accent">MONITOR</span>
            </h1>
            <p className="text-white/60 font-medium">Suivi télémétrique & Vidéo FPV — Agri-X4 Unit #01</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
              <Signal size={12} />
              Liaison Satellite Active
            </div>
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera View - Bento Large */}
        <Reveal direction="right" className="lg:col-span-2">
          <div className="glass-panel rounded-[2.5rem] h-[500px] relative overflow-hidden border border-white/10 group shadow-2xl">
            {/* Simulated Video Feed Background */}
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1920" 
                alt="Drone View" 
                className="w-full h-full object-cover brightness-75 saturate-[1.2]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
              
              {/* Scanning Lines Effect */}
              <div className="absolute inset-0 pointer-events-none opacity-10" style={{
                backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                backgroundSize: '100% 2px, 3px 100%'
              }} />
            </div>

            {/* HUD Overlay */}
            <div className="absolute inset-0 z-10 p-8 flex flex-col justify-between pointer-events-none">
              {/* Top HUD */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-farm-accent">
                    <Camera size={20} className="animate-pulse" />
                    <h3 className="text-lg font-black tracking-tighter uppercase">FLUX VIDÉO <span className="text-white">LIVE</span></h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-white/80 uppercase tracking-widest">REC 00:14:52</span>
                  </div>
                </div>

                <div className="glass-panel px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-md">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-farm-accent uppercase tracking-widest mb-1">Coordonnées GPS</span>
                    <div className="text-xs font-mono text-white flex gap-4">
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] text-white/40 uppercase">Latitude</span>
                        <span className="text-white/100">{telemetry.lat.toFixed(6)}° N</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] text-white/40 uppercase">Longitude</span>
                        <span className="text-white/100">{telemetry.lon.toFixed(6)}° E</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Crosshair & Horizon */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-20 flex justify-between items-center opacity-40">
                {/* Left Horizon Scale */}
                <div className="flex flex-col items-end gap-2">
                  {[150, 140, 130, 120, 110, 100].map(h => (
                    <div key={h} className="flex items-center gap-2">
                      <span className="text-[8px] font-mono">{h}</span>
                      <div className={cn("h-[1px] bg-white", h === 120 ? "w-8" : "w-4")} />
                    </div>
                  ))}
                </div>

                <div className="relative w-32 h-32 flex items-center justify-center">
                  <div className="absolute inset-0 border border-white/20 rounded-full" />
                  <div className="absolute w-12 h-[1px] bg-farm-accent left-0" />
                  <div className="absolute w-12 h-[1px] bg-farm-accent right-0" />
                  <div className="absolute h-12 w-[1px] bg-farm-accent top-0" />
                  <div className="absolute h-12 w-[1px] bg-farm-accent bottom-0" />
                  <Crosshair size={24} className="text-farm-accent" />
                  
                  {/* Pitch indicator */}
                  <motion.div 
                    animate={{ rotate: (Math.random() - 0.5) * 5 }}
                    className="absolute w-40 h-[1px] bg-white/20"
                  />
                </div>

                {/* Right Speed Scale */}
                <div className="flex flex-col items-start gap-2">
                  {[60, 50, 40, 30, 20, 10].map(s => (
                    <div key={s} className="flex items-center gap-2">
                      <div className={cn("h-[1px] bg-white", s === 40 ? "w-8" : "w-4")} />
                      <span className="text-[8px] font-mono">{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom HUD */}
              <div className="flex justify-between items-end">
                <div className="flex gap-4">
                  <div className="glass-panel p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                    <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Orientation</div>
                    <div className="flex items-center gap-2">
                      <Compass size={14} className="text-farm-accent" style={{ transform: `rotate(${telemetry.heading}deg)` }} />
                      <span className="text-sm font-mono font-bold">{Math.round(telemetry.heading)}°</span>
                    </div>
                  </div>
                  <div className="glass-panel p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                    <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Signal</div>
                    <div className="flex items-center gap-1">
                      <Signal size={14} className="text-green-400" />
                      <span className="text-sm font-mono font-bold">98%</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pointer-events-auto">
                  <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group/btn">
                    <Eye size={18} className="group-hover/btn:text-farm-accent" />
                  </button>
                  <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group/btn">
                    <Maximize2 size={18} className="group-hover/btn:text-farm-accent" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Telemetry Bento Column */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <Reveal direction="left" delay={0.1}>
            <TelemetryCard 
              icon={<Battery size={20} />} 
              label="Batterie" 
              value={telemetry.battery} 
              unit="%" 
              colorClass={telemetry.battery > 20 ? "text-green-400" : "text-red-500"}
              progress={telemetry.battery}
            />
          </Reveal>
          <Reveal direction="left" delay={0.2}>
            <TelemetryCard 
              icon={<Zap size={20} />} 
              label="Altitude" 
              value={telemetry.altitude} 
              unit="M" 
              colorClass="text-blue-400"
            />
          </Reveal>
          <Reveal direction="left" delay={0.3}>
            <TelemetryCard 
              icon={<Wind size={20} />} 
              label="Vitesse" 
              value={telemetry.speed} 
              unit="KM/H" 
              colorClass="text-purple-400"
            />
          </Reveal>
          <Reveal direction="left" delay={0.4}>
            <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col gap-2 bg-farm-accent/5">
              <div className="text-[10px] font-black uppercase tracking-widest text-white/30">Statut Mission</div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-farm-accent animate-ping absolute inset-0" />
                  <div className="w-3 h-3 rounded-full bg-farm-accent relative" />
                </div>
                <span className="text-sm font-black tracking-tight">{telemetry.status}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center">
                <span className="text-[9px] font-bold text-white/20 uppercase">Temps écoulé</span>
                <span className="text-[10px] font-mono text-farm-accent">00:14:52</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <Reveal direction="up" delay={0.5}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 flex items-center gap-4">
            <Compass className="text-white/20" size={24} />
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-white/30">Cap</div>
              <div className="text-lg font-black tracking-tighter">{Math.round(telemetry.heading)}°</div>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-3xl border border-white/10 flex items-center gap-4">
            <Activity className="text-white/20" size={24} />
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-white/30">Charge CPU</div>
              <div className="text-lg font-black tracking-tighter">14%</div>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-3xl border border-white/10 flex items-center gap-4">
            <Signal className="text-white/20" size={24} />
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-white/30">Latence</div>
              <div className="text-lg font-black tracking-tighter">24ms</div>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-3xl border border-white/10 flex items-center gap-4">
            <AlertCircle className="text-white/20" size={24} />
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-white/30">Erreurs</div>
              <div className="text-lg font-black tracking-tighter">0</div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
