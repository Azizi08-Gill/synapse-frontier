import React from 'react';
import { AlgorithmType } from '@/hooks/usePathfinder';
import { Agent } from '@/hooks/useAgents';
import { cn } from '@/lib/utils';
import { Activity, Clock, Fuel, Route, Zap } from 'lucide-react';

interface StatsPanelProps {
  algorithm: AlgorithmType;
  visitedCount: number;
  pathLength: number;
  agents: Agent[];
  weatherEffect: 'clear' | 'rain' | 'snow';
  isRunning: boolean;
}

const StatsPanel: React.FC<StatsPanelProps> = ({
  algorithm,
  visitedCount,
  pathLength,
  agents,
  weatherEffect,
  isRunning,
}) => {
  const getAlgorithmColor = () => {
    switch (algorithm) {
      case 'bfs': return 'text-primary border-primary/50';
      case 'dfs': return 'text-secondary border-secondary/50';
      case 'astar': return 'text-accent border-accent/50';
    }
  };

  const stats = [
    {
      label: 'Algorithm',
      value: algorithm.toUpperCase(),
      icon: <Zap className="w-4 h-4" />,
      color: getAlgorithmColor(),
    },
    {
      label: 'Cells Explored',
      value: visitedCount,
      icon: <Activity className="w-4 h-4" />,
      color: 'text-primary border-primary/30',
    },
    {
      label: 'Path Length',
      value: pathLength || '—',
      icon: <Route className="w-4 h-4" />,
      color: 'text-accent border-accent/30',
    },
    {
      label: 'Active Agents',
      value: agents.length,
      icon: <Fuel className="w-4 h-4" />,
      color: 'text-secondary border-secondary/30',
    },
  ];

  return (
    <div className="neo-panel p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm text-primary neo-text-glow tracking-widest">
          SIMULATION STATS
        </h3>
        {isRunning && (
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-primary animate-pulse" />
            <span className="text-xs text-primary">Processing...</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={cn(
              "p-3 rounded-lg border bg-muted/30 backdrop-blur-sm",
              stat.color,
              "transition-all duration-300 hover:bg-muted/50"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              {stat.icon}
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
            <p className="font-display text-2xl font-bold">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Weather Impact */}
      {weatherEffect !== 'clear' && (
        <div className="mt-4 p-3 rounded-lg border border-secondary/30 bg-secondary/10">
          <div className="flex items-center gap-2 text-secondary">
            <span className="text-xs font-display uppercase tracking-wider">
              Weather Impact Active
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {weatherEffect === 'rain' 
              ? 'Rain detected: P(Accident) = 0.35 on wet roads'
              : 'Snow detected: P(Delay | Snow) = 0.50 on icy roads'}
          </p>
        </div>
      )}

      {/* Efficiency metrics */}
      {pathLength > 0 && visitedCount > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Search Efficiency: {' '}
            <span className="text-primary font-mono">
              {((pathLength / visitedCount) * 100).toFixed(1)}%
            </span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Explored {visitedCount} cells to find a path of {pathLength}
          </p>
        </div>
      )}
    </div>
  );
};

export default StatsPanel;
