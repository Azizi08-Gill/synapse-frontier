import React from 'react';
import { AlgorithmType } from '@/hooks/usePathfinder';
import { Agent } from '@/hooks/useAgents';
import { cn } from '@/lib/utils';
import { Activity, Clock, Truck, Route, Zap, Cpu, BarChart, DollarSign, Wallet } from 'lucide-react';

export interface CoreStats {
  id: number;
  algorithm: AlgorithmType;
  visitedCount: number;
  pathLength: number;
  pathCost?: number;
  isRunning: boolean;
}

interface StatsPanelProps {
  cores: CoreStats[];
  agents: Agent[];
  weatherEffect: string;
}

const StatsPanel: React.FC<StatsPanelProps> = ({
  cores,
  agents,
}) => {
  const isAnyRunning = cores.some(c => c.isRunning);

  const getAlgorithmColor = (algo: AlgorithmType) => {
    switch (algo) {
      case 'bfs': return 'text-primary border-primary/50';
      case 'dfs': return 'text-secondary border-secondary/50';
      case 'astar': return 'text-emerald-500 border-emerald-500/50';
      default: return 'text-primary border-primary/50';
    }
  };

  return (
    <div className="bg-card border border-border p-4 overflow-y-auto max-h-[40vh] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h3 className="font-mono text-sm font-bold text-foreground uppercase flex items-center gap-2">
          <BarChart className="w-4 h-4 text-primary" />
          Analytics
        </h3>
        {isAnyRunning && (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-[10px] text-primary uppercase font-bold">Computing</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {cores.map((core, index) => (
          <div key={core.id} className={cn(
            "space-y-2 rounded-sm border p-3 transition-all",
            cores.length > 1 ? "bg-muted/10 border-border/50" : "border-transparent p-0"
          )}>
            {cores.length > 1 && (
              <div className="flex items-center justify-between border-b border-border/30 pb-1 mb-2">
                <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">
                  Unit 0{core.id} // <span className="text-foreground">{core.algorithm.toUpperCase()}</span>
                </span>
                {core.isRunning && <Activity className="w-3 h-3 text-primary animate-pulse" />}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {/* Algorithm Badge */}
              {cores.length === 1 && (
                <div className={cn("p-2 rounded-sm border bg-muted/30 flex flex-col justify-center", getAlgorithmColor(core.algorithm))}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Zap className="w-3 h-3" />
                    <span className="text-[10px] uppercase font-bold">Logic</span>
                  </div>
                  <span className="text-lg font-bold font-mono">{core.algorithm.toUpperCase()}</span>
                </div>
              )}

              {/* Visited */}
              <div className="p-2 rounded-sm border bg-muted/30 border-border">
                <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">
                  <Activity className="w-3 h-3" />
                  <span className="text-[10px] uppercase font-bold">Scanned</span>
                </div>
                <span className="text-xl font-bold font-mono text-foreground">{core.visitedCount}</span>
              </div>

              {/* Path Length */}
              <div className="p-2 rounded-sm border bg-muted/30 border-border">
                <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">
                  <Route className="w-3 h-3" />
                  <span className="text-[10px] uppercase font-bold">Distance</span>
                </div>
                <span className="text-xl font-bold font-mono text-foreground">{core.pathLength || '-'}</span>
              </div>

              {/* Total Cost - NEW FIELD */}
              <div className="p-2 rounded-sm border bg-muted/30 border-border">
                <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">
                  <Wallet className="w-3 h-3" />
                  <span className="text-[10px] uppercase font-bold">Op Cost</span>
                </div>
                <span className={cn(
                  "text-xl font-bold font-mono",
                  core.pathCost ? "text-primary" : "text-muted-foreground"
                )}>
                  {core.pathCost ? `$${core.pathCost}` : '-'}
                </span>
              </div>
            </div>

            {/* Efficiency */}
            {core.pathLength > 0 && core.visitedCount > 0 && (
              <div className="pt-2">
                <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-bold mb-1">
                  <span>Routing Efficiency</span>
                  <span className={cn(
                    "font-mono",
                    index === 0 ? "text-primary" : index === 1 ? "text-secondary" : "text-emerald-500"
                  )}>
                    {((core.pathLength / core.visitedCount) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", index === 0 ? "bg-primary" : index === 1 ? "bg-secondary" : "bg-emerald-500")}
                    style={{ width: `${(core.pathLength / core.visitedCount) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Global Stats (Agents/Weather) */}
      <div className="space-y-2 mt-auto pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-sm border border-border bg-muted/30">
            <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">
              <Truck className="w-3 h-3" />
              <span className="text-[10px] uppercase font-bold">Active AGVs</span>
            </div>
            <span className="text-lg font-bold font-mono text-foreground">{agents.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
