import React from 'react';
import { Button } from '@/components/ui/button';
import { CellType, AlgorithmType } from '@/hooks/usePathfinder';
import { AgentType, Agent } from '@/hooks/useAgents';
import {
  Truck,
  Plane,
  Ambulance,
  Play,
  RotateCcw,
  Trash2,
  MapPin,
  Target,
  Box,
  Ban,
  Zap,
  Settings,
  Cpu,
  Activity,
  User,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentSidebarProps {
  numCores: number;
  setNumCores: (n: number) => void;
  selectedAlgos: AlgorithmType[];
  setSelectedAlgos: (algos: AlgorithmType[]) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  placementMode: CellType;
  setPlacementMode: (mode: CellType) => void;
  onRunAlgorithm: () => void;
  onResetGrid: () => void;
  onClearPath: () => void;
  isRunning: boolean;
  startPos: { x: number; y: number } | null;
  endPos: { x: number; y: number } | null;
  agents: Agent[];
  onSpawnAgent: (type: AgentType, position: { x: number; y: number }) => void;
  onRemoveAgent: (id: string) => void;
  weatherEffect: string;
  setWeatherEffect: (effect: any) => void;
  pathCosts: number[];
}

const AgentSidebar: React.FC<AgentSidebarProps> = ({
  numCores,
  setNumCores,
  selectedAlgos,
  setSelectedAlgos,
  speed,
  setSpeed,
  placementMode,
  setPlacementMode,
  onRunAlgorithm,
  onResetGrid,
  onClearPath,
  isRunning,
  startPos,
  endPos,
  agents,
  onSpawnAgent,
  pathCosts,
}) => {
  const algorithms: { id: AlgorithmType; name: string; color: string; description: string }[] = [
    { id: 'bfs', name: 'BFS', color: 'primary', description: 'Breadth-First Search' },
    { id: 'dfs', name: 'DFS', color: 'secondary', description: 'Depth-First Search' },
    { id: 'ucs', name: 'UCS', color: 'accent', description: 'Uniform Cost Search' },
    { id: 'astar', name: 'A*', color: 'purple-500', description: 'A* Search' },
    { id: 'greedy', name: 'Greedy', color: 'amber-500', description: 'Greedy Best-First' },
    { id: 'bidirectional', name: 'Bi-Dir', color: 'emerald-500', description: 'Bidirectional' },
    { id: 'beam', name: 'Beam', color: 'pink-500', description: 'Beam Search' },
    { id: 'iddfs', name: 'IDDFS', color: 'primary', description: 'Iterative Deepening' },
  ];

  const placements: { type: CellType; icon: React.ReactNode; label: string }[] = [
    { type: 'start', icon: <Zap className="w-4 h-4" />, label: 'Charge Stn' }, // Charging Station (Start)
    { type: 'end', icon: <Package className="w-4 h-4" />, label: 'Pickup Zone' }, // Pickup Zone (End)
    { type: 'building', icon: <Box className="w-4 h-4" />, label: 'Racks' },
    { type: 'obstacle', icon: <Ban className="w-4 h-4" />, label: 'Danger Zone' },
    { type: 'road', icon: <Activity className="w-4 h-4" />, label: 'Aisle' },
  ];

  const agentTypes: { type: AgentType; icon: React.ReactNode; label: string; description: string }[] = [
    { type: 'reflex', icon: <Truck className="w-4 h-4" />, label: 'Reflex AGV', description: 'Simple reflex agent' },
    { type: 'goal', icon: <Truck className="w-4 h-4" />, label: 'Smart Forklift', description: 'Goal-based pathfinder' },
    { type: 'utility', icon: <User className="w-4 h-4" />, label: 'Supervisor Bot', description: 'Utility-based safety agent' },
  ];

  return (
    <div className="w-80 bg-card border-r border-border p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-white/10">
        <h2 className="font-mono text-xl font-bold text-primary tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5" />
          LOGISTICS CONTROL
        </h2>
        <p className="text-xs text-muted-foreground">
          configure automated guided vehicles
        </p>
      </div>

      {/* Core Allocation */}
      <div className="space-y-3">
        <h3 className="font-mono text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
          <Cpu className="w-3 h-3" />
          Fleet Processing Units
        </h3>
        <div className="flex gap-1 bg-muted p-1 rounded-sm">
          {[1, 2, 3].map(n => (
            <Button
              key={n}
              variant={numCores === n ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setNumCores(n)}
              className={cn(
                "flex-1 h-7 text-[10px] font-bold tracking-wider rounded-sm",
                numCores === n ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              UNIT {n}
            </Button>
          ))}
        </div>
      </div>

      {/* Algorithm Selection */}
      <div className="space-y-3">
        <h3 className="font-mono text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
          <Activity className="w-3 h-3" />
          Navigation Logic
        </h3>

        <div className="space-y-3">
          {Array.from({ length: numCores }).map((_, index) => (
            <div key={index} className="space-y-1">
              {numCores > 1 && (
                <p className="text-[10px] text-primary font-mono uppercase">
                    // UNIT_0{index + 1}
                </p>
              )}
              <div className="grid grid-cols-4 gap-1">
                {algorithms.map(algo => (
                  <button
                    key={algo.id}
                    onClick={() => {
                      const newAlgos = [...selectedAlgos];
                      newAlgos[index] = algo.id;
                      setSelectedAlgos(newAlgos);
                    }}
                    className={cn(
                      "h-8 text-[9px] font-bold rounded-sm border transition-all uppercase tracking-tight",
                      selectedAlgos[index] === algo.id
                        ? "bg-primary/20 border-primary text-primary"
                        : "bg-transparent border-transparent hover:bg-muted text-muted-foreground"
                    )}
                    title={algo.name}
                  >
                    {algo.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Speed Control */}
      <div className="space-y-3">
        <h3 className="font-mono text-xs font-bold text-muted-foreground uppercase">
          Ops Tempo
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground font-mono">FAST</span>
          <input
            type="range"
            min="10"
            max="200"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="flex-1 accent-primary h-1 bg-muted rounded-full cursor-pointer appearance-none"
          />
          <span className="text-[10px] text-muted-foreground font-mono">PRECISE</span>
        </div>
      </div>

      {/* Grid Placement */}
      <div className="space-y-3">
        <h3 className="font-mono text-xs font-bold text-muted-foreground uppercase">
          Floor Plan Editor
        </h3>
        <div className="grid grid-cols-5 gap-1">
          {placements.map(item => (
            <Button
              key={item.type}
              variant={placementMode === item.type ? 'default' : 'outline'}
              size="icon"
              onClick={() => setPlacementMode(item.type)}
              title={item.label}
              className={cn(
                "h-10 w-full rounded-sm border-muted-foreground/20",
                placementMode === item.type && "border-primary ring-1 ring-primary ring-offset-0"
              )}
            >
              {item.icon}
            </Button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground text-center uppercase">
          Selected: <span className="text-foreground font-bold">{placements.find(p => p.type === placementMode)?.label}</span>
        </p>
      </div>

      {/* Agent Factory */}
      <div className="space-y-3 pt-2 border-t border-border">
        {/* Removed redundant header since buttons are self explanatory or we can keep it */}
        <div className="space-y-2">
          {agentTypes.map(agent => (
            <Button
              key={agent.type}
              variant="secondary"
              size="sm"
              onClick={() => onSpawnAgent(agent.type, { x: 0, y: 0 })}
              className="w-full justify-start gap-2 text-xs font-mono"
              disabled={isRunning}
            >
              {agent.icon}
              <span>DEPLOY {agent.label.toUpperCase()}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-4 border-t border-border">
        <Button
          onClick={onRunAlgorithm}
          disabled={!startPos || !endPos || isRunning}
          className="w-full font-bold tracking-widest"
          variant="default"
        >
          <Play className="w-4 h-4 mr-2" />
          {isRunning ? 'EXECUTING...' : 'INITIATE ROUTE'}
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={onClearPath}
            variant="ghost"
            size="sm"
            disabled={isRunning}
            className="text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            CLEAR PATH
          </Button>
          <Button
            onClick={onResetGrid}
            variant="ghost"
            size="sm"
            disabled={isRunning}
            className="text-xs hover:bg-destructive hover:text-white"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            RESET FLOOR
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgentSidebar;
