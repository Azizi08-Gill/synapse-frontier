import React from 'react';
import { AlgorithmType } from '@/hooks/usePathfinder';
import { cn } from '@/lib/utils';

interface AlgorithmLegendProps {
  algorithm: AlgorithmType;
}

const AlgorithmLegend: React.FC<AlgorithmLegendProps> = ({ algorithm }) => {
  const items = [
    { label: 'Start', className: 'bg-accent shadow-[0_0_10px_hsl(var(--accent))]' },
    { label: 'End', className: 'bg-secondary shadow-[0_0_10px_hsl(var(--secondary))]' },
    { label: 'Road', className: 'bg-grid-road' },
    { label: 'Building', className: 'bg-grid-building' },
    { label: 'Obstacle', className: 'bg-grid-obstacle' },
    {
      label: 'Visited',
      className: cn(
        algorithm === 'bfs' && 'bg-primary/30',
        algorithm === 'dfs' && 'bg-secondary/30',
        (algorithm === 'astar' || algorithm === 'ucs') && 'bg-accent/30',
        algorithm === 'bidirectional' && 'bg-[hsl(var(--neon-emerald))/0.3]',
        algorithm === 'beam' && 'bg-[hsl(var(--neon-pink))/0.3]',
        algorithm === 'iddfs' && 'bg-primary/30'
      )
    },
    {
      label: 'Path',
      className: cn(
        algorithm === 'bfs' && 'bg-primary',
        algorithm === 'dfs' && 'bg-secondary',
        (algorithm === 'astar' || algorithm === 'ucs') && 'bg-accent',
        algorithm === 'bidirectional' && 'bg-[hsl(var(--neon-emerald))]',
        algorithm === 'beam' && 'bg-[hsl(var(--neon-pink))]',
        algorithm === 'iddfs' && 'bg-primary'
      )
    },
  ];

  return (
    <div className="neo-panel p-3">
      <h4 className="font-display text-xs text-muted-foreground tracking-widest uppercase mb-3">
        Legend
      </h4>
      <div className="grid grid-cols-4 gap-2">
        {items.map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-sm", item.className)} />
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlgorithmLegend;
