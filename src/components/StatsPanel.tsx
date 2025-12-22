import React from 'react';
import { AlgorithmType } from '@/hooks/usePathfinder';
import { Agent } from '@/hooks/useAgents';
import { cn } from '@/lib/utils';
import { Activity, Clock, Fuel, Route, Zap, Cpu } from 'lucide-react';

export interface CoreStats {
  id: number;
  algorithm: AlgorithmType;
  visitedCount: number;
  pathLength: number;
  isRunning: boolean;
}

interface StatsPanelProps {
  cores: CoreStats[];
  agents: Agent[];
  weatherEffect: 'clear' | 'rain' | 'snow';
}

const StatsPanel: React.FC<StatsPanelProps> = ({
  cores,
  agents,
  weatherEffect,
}) => {
  const isAnyRunning = cores.some(c => c.isRunning);

  const getAlgorithmColor = (algo: AlgorithmType) => {
    switch (algo) {
      case 'bfs': return 'text-primary border-primary/50';
      case 'dfs': return 'text-secondary border-secondary/50';
      case 'ucs': return 'text-accent border-accent/50';
      case 'astar': return 'text-neon-purple border-neon-purple/50';
      case 'greedy': return 'text-neon-amber border-neon-amber/50';
      case 'bidirectional': return 'text-neon-emerald border-neon-emerald/50';
      case 'beam': return 'text-neon-pink border-neon-pink/50';
      case 'iddfs': return 'text-primary border-primary/50';
      default: return 'text-primary border-primary/50';
    }
  };

  return (
    <div className="neo-panel p-4 overflow-y-auto max-h-[40vh] scrollbar-cyber">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm text-primary neo-text-glow tracking-widest flex items-center gap-2">
          <Cpu className="w-4 h-4" />
          SIMULATION STATS
        </h3>
        {isAnyRunning && (
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-primary animate-pulse" />
            <span className="text-[10px] text-primary uppercase">Processing</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {cores.map((core, index) => (
          <div key={core.id} className={cn(
            "space-y-2 rounded-lg border p-3 transition-all",
            cores.length > 1 ? "bg-muted/10 border-border/50" : "border-transparent p-0"
          )}>
            {cores.length > 1 && (
              <div className="flex items-center justify-between border-b border-border/30 pb-1 mb-2">
                <span className="text-xs font-mono text-muted-foreground uppercase">Core 0{core.id} // <span className={cn(
                  index === 0 ? "text-primary" : index === 1 ? "text-secondary" : "text-accent"
                )}>{core.algorithm.toUpperCase()}</span></span>
                {core.isRunning && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {/* Algorithm Badge */}
              {cores.length === 1 && (
                <div className={cn("p-2 rounded border bg-muted/30 flex flex-col justify-center", getAlgorithmColor(core.algorithm))}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Zap className="w-3 h-3" />
                    <span className="text-[10px] uppercase">Algorithm</span>
                  </div>
                  <span className="text-lg font-bold font-display">{core.algorithm.toUpperCase()}</span>
                </div>
              )}

              {/* Visited */}
              <div className="p-2 rounded border bg-muted/30 border-primary/20">
                <div className="flex items-center gap-1.5 mb-1 text-primary">
                  <Activity className="w-3 h-3" />
                  <span className="text-[10px] uppercase">Explored</span>
                </div>
                <span className="text-xl font-bold font-display text-foreground">{core.visitedCount}</span>
              </div>

              {/* Path Length */}
              <div className="p-2 rounded border bg-muted/30 border-accent/20">
                <div className="flex items-center gap-1.5 mb-1 text-accent">
                  <Route className="w-3 h-3" />
                  <span className="text-[10px] uppercase">Path Len</span>
                </div>
                <span className="text-xl font-bold font-display text-foreground">{core.pathLength || '-'}</span>
              </div>
            </div>

            {/* Efficiency */}
            {core.pathLength > 0 && core.visitedCount > 0 && (
              <div className="pt-2">
                <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                  <span>Search Efficiency</span>
                  <span className={cn(
                    "font-mono",
                    index === 0 ? "text-primary" : index === 1 ? "text-secondary" : "text-accent"
                  )}>
                    {((core.pathLength / core.visitedCount) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-muted/50 h-1 mt-1 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", index === 0 ? "bg-primary" : index === 1 ? "bg-secondary" : "bg-accent")}
                    style={{ width: `${(core.pathLength / core.visitedCount) * 100}%` }}
                  />
                </div>
                {cores.length === 1 && (
                  <p className="text-[10px] text-muted-foreground mt-1 text-right">
                    Explored {core.visitedCount} for path of {core.pathLength}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Global Stats (Agents/Weather) */}
      <div className="space-y-2 mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded border border-secondary/20 bg-muted/30">
            <div className="flex items-center gap-1.5 mb-1 text-secondary">
              <Fuel className="w-3 h-3" />
              <span className="text-[10px] uppercase">Agents</span>
            </div>
            <span className="text-lg font-bold font-display text-foreground">{agents.length}</span>
          </div>

          {weatherEffect !== 'clear' && (
            <div className="p-2 rounded border border-accent/20 bg-muted/30 flex flex-col justify-center">
              <span className="text-[10px] uppercase text-accent mb-1">{weatherEffect === 'rain' ? 'Rain' : 'Snow'}</span>
              <span className="text-xs text-muted-foreground leading-tight">
                {weatherEffect === 'rain' ? '+35% Risk' : '+50% Delay'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
