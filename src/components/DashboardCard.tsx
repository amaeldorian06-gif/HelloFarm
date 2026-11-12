import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../lib/utils';

interface DashboardCardProps {
  label: string;
  value: string | number;
  unit: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  description?: string;
  className?: string;
}

const DashboardCard = memo(({ label, value, unit, icon, trend, description, className }: DashboardCardProps) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={cn("glass-card rounded-3xl p-6 flex flex-col gap-4", className)}
    >
      <div className="flex justify-between items-start">
        <div className="p-3 rounded-2xl bg-white/5 text-farm-accent border border-white/10">
          {icon}
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase",
            trend === 'up' ? "bg-green-500/20 text-green-400" : 
            trend === 'down' ? "bg-red-500/20 text-red-400" : 
            "bg-zinc-500/20 text-zinc-400"
          )}>
            {trend === 'up' ? <TrendingUp size={12} /> : 
             trend === 'down' ? <TrendingDown size={12} /> : 
             <Minus size={12} />}
            {trend === 'up' ? "+2.4%" : trend === 'down' ? "-1.2%" : "Stable"}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-white/50 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
          <span className="text-sm font-medium text-white/40">{unit}</span>
        </div>
      </div>

      {description && (
        <p className="text-[11px] text-white/40 leading-relaxed italic">
          "{description}"
        </p>
      )}
    </motion.div>
  );
});

export default DashboardCard;
