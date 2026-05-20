import { motion, AnimatePresence } from 'framer-motion';
import { STAT_COLORS, STAT_LABELS } from '@/constants/pokemon';
import { getStatPercent, cn } from '@/utils/pokemon';
import type { PokemonStat } from '@/types/pokemon';

interface StatBarProps {
  stat: PokemonStat;
  animate?: boolean;
  delay?: number;
}

function StatBar({ stat, animate = true, delay = 0 }: StatBarProps) {
  const percent = getStatPercent(stat.baseStat, stat.name);
  const color = STAT_COLORS[stat.name] ?? 'bg-violet-400';
  const label = STAT_LABELS[stat.name] ?? stat.name;

  const getStatColor = (val: number) => {
    if (val >= 130) return 'text-green-400';
    if (val >= 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-xs text-gray-400 font-medium text-right shrink-0">{label}</span>
      <div className="stat-bar flex-1">
        <motion.div
          className={cn('stat-fill', color)}
          initial={animate ? { width: 0 } : { width: `${percent}%` }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, delay, ease: 'easeOut' }}
        />
      </div>
      <span className={cn('w-8 text-xs font-bold tabular-nums', getStatColor(stat.baseStat))}>
        {stat.baseStat}
      </span>
    </div>
  );
}

interface StatChartProps {
  stats: PokemonStat[];
}

export function StatChart({ stats }: StatChartProps) {
  const total = stats.reduce((sum, s) => sum + s.baseStat, 0);

  return (
    <div className="space-y-3">
      {stats.map((stat, i) => (
        <StatBar key={stat.name} stat={stat} delay={i * 0.1} />
      ))}
      <div className="border-t border-white/10 pt-3 flex items-center gap-3">
        <span className="w-16 text-xs text-gray-400 font-medium text-right shrink-0">Total</span>
        <div className="flex-1" />
        <span className="w-8 text-xs font-bold text-violet-400 tabular-nums">{total}</span>
      </div>
    </div>
  );
}
