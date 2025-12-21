import React from 'react';
import { Button } from '@/components/ui/button';
import { CellType, AlgorithmType } from '@/hooks/usePathfinder';
import { AgentType, Agent } from '@/hooks/useAgents';
import {
  Car,
  Plane,
  Ambulance,
  Play,
  RotateCcw,
  Trash2,
  MapPin,
  Target,
  Building2,
  Ban,
  Zap,
  CloudRain,
  Snowflake,
  Sun
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentSidebarProps {
  algorithm: AlgorithmType;
  setAlgorithm: (algo: AlgorithmType) => void;
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
  weatherEffect: 'clear' | 'rain' | 'snow';
  setWeatherEffect: (effect: 'clear' | 'rain' | 'snow') => void;
}

const AgentSidebar: React.FC<AgentSidebarProps> = ({
  algorithm,
  setAlgorithm,
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
  onRemoveAgent,
  weatherEffect,
  setWeatherEffect,
}) => {
  const algorithms: { id: AlgorithmType; name: string; color: string; description: string }[] = [
    { id: 'bfs', name: 'BFS', color: 'primary', description: 'Breadth-First Search - Shortest path guarantee' },
    { id: 'dfs', name: 'DFS', color: 'secondary', description: 'Depth-First Search - Deep exploration' },
    { id: 'ucs', name: 'UCS', color: 'accent', description: 'Uniform Cost Search - Lowest cost path' },
    { id: 'astar', name: 'A*', color: 'neon-purple', description: 'A* Search - Optimal pathfinding' },
    { id: 'greedy', name: 'Greedy', color: 'neon-amber', description: 'Greedy Best-First - Fast but not optimal' },
    { id: 'bidirectional', name: 'Bi-Dir', color: 'neon-emerald', description: 'Bidirectional Search - Meet in middle' },
    { id: 'beam', name: 'Beam', color: 'neon-pink', description: 'Beam Search - Memory optimized' },
    { id: 'iddfs', name: 'IDDFS', color: 'primary', description: 'Iterative Deepening DFS' },
  ];

  const placements: { type: CellType; icon: React.ReactNode; label: string }[] = [
    { type: 'start', icon: <MapPin className="w-4 h-4" />, label: 'Start' },
    { type: 'end', icon: <Target className="w-4 h-4" />, label: 'End' },
    { type: 'building', icon: <Building2 className="w-4 h-4" />, label: 'Building' },
    { type: 'obstacle', icon: <Ban className="w-4 h-4" />, label: 'Obstacle' },
    { type: 'road', icon: <Zap className="w-4 h-4" />, label: 'Road' },
  ];

  const agentTypes: { type: AgentType; icon: React.ReactNode; label: string; description: string }[] = [
    { type: 'reflex', icon: <Car className="w-4 h-4" />, label: 'Reflex Car', description: 'Simple reflex agent - detects front cell only' },
    { type: 'goal', icon: <Plane className="w-4 h-4" />, label: 'Delivery Drone', description: 'Goal-based agent with destination' },
    { type: 'utility', icon: <Ambulance className="w-4 h-4" />, label: 'Smart Ambulance', description: 'Utility-based agent calculates happiness' },
  ];

  const weatherOptions: { type: 'clear' | 'rain' | 'snow'; icon: React.ReactNode; label: string }[] = [
    { type: 'clear', icon: <Sun className="w-4 h-4" />, label: 'Clear' },
    { type: 'rain', icon: <CloudRain className="w-4 h-4" />, label: 'Rain' },
    { type: 'snow', icon: <Snowflake className="w-4 h-4" />, label: 'Snow' },
  ];

  return (
    <div className="w-80 neo-panel p-4 space-y-6 overflow-y-auto scrollbar-cyber max-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="font-display text-xl text-primary neo-text-glow tracking-wider">
          CONTROL CENTER
        </h2>
        <p className="text-xs text-muted-foreground">
          Configure agents and algorithms
        </p>
      </div>

      {/* Algorithm Selection */}
      <div className="space-y-3">
        <h3 className="font-display text-sm text-foreground tracking-widest uppercase flex items-center gap-2">
          <div className="w-1 h-4 bg-primary rounded-full" />
          Search Algorithm
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {algorithms.map(algo => (
            <Button
              key={algo.id}
              variant={algorithm === algo.id ?
                (algo.color === 'primary' ? 'neon' :
                  algo.color === 'secondary' ? 'neon-amber' : 'neon-emerald')
                : 'ghost'}
              size="sm"
              onClick={() => setAlgorithm(algo.id)}
              className={cn(
                "font-display text-xs",
                algorithm === algo.id && "font-bold"
              )}
            >
              {algo.name}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground italic">
          {algorithms.find(a => a.id === algorithm)?.description}
        </p>
      </div>

      {/* Speed Control */}
      <div className="space-y-3">
        <h3 className="font-display text-sm text-foreground tracking-widest uppercase flex items-center gap-2">
          <div className="w-1 h-4 bg-secondary rounded-full" />
          Animation Speed
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Fast</span>
          <input
            type="range"
            min="10"
            max="200"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="flex-1 accent-primary h-1 bg-muted rounded-full cursor-pointer"
          />
          <span className="text-xs text-muted-foreground">Slow</span>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {speed}ms per step
        </p>
      </div>

      {/* Grid Placement */}
      <div className="space-y-3">
        <h3 className="font-display text-sm text-foreground tracking-widest uppercase flex items-center gap-2">
          <div className="w-1 h-4 bg-accent rounded-full" />
          Grid Editor
        </h3>
        <div className="grid grid-cols-5 gap-1">
          {placements.map(item => (
            <Button
              key={item.type}
              variant={placementMode === item.type ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setPlacementMode(item.type)}
              title={item.label}
              className="h-10 w-10"
            >
              {item.icon}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Click on grid to place: <span className="text-primary">{placementMode}</span>
        </p>
      </div>

      {/* Weather Layer */}
      <div className="space-y-3">
        <h3 className="font-display text-sm text-foreground tracking-widest uppercase flex items-center gap-2">
          <div className="w-1 h-4 bg-neon-purple rounded-full" />
          Weather Layer
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {weatherOptions.map(option => (
            <Button
              key={option.type}
              variant={weatherEffect === option.type ? 'cyber' : 'ghost'}
              size="sm"
              onClick={() => setWeatherEffect(option.type)}
              className="flex items-center gap-1"
            >
              {option.icon}
              <span className="text-xs">{option.label}</span>
            </Button>
          ))}
        </div>
        {weatherEffect !== 'clear' && (
          <p className="text-xs text-secondary">
            ⚠ P(Delay) increased by {weatherEffect === 'rain' ? '35%' : '50%'}
          </p>
        )}
      </div>

      {/* Agent Factory */}
      <div className="space-y-3">
        <h3 className="font-display text-sm text-foreground tracking-widest uppercase flex items-center gap-2">
          <div className="w-1 h-4 bg-neon-pink rounded-full" />
          Agent Factory
        </h3>
        <div className="space-y-2">
          {agentTypes.map(agent => (
            <Button
              key={agent.type}
              variant="outline"
              size="sm"
              onClick={() => onSpawnAgent(agent.type, { x: 0, y: 0 })}
              className="w-full justify-start gap-2 text-xs"
              disabled={isRunning}
            >
              {agent.icon}
              <span>{agent.label}</span>
            </Button>
          ))}
        </div>

        {/* Active Agents */}
        {agents.length > 0 && (
          <div className="space-y-2 mt-3">
            <p className="text-xs text-muted-foreground">Active Agents:</p>
            {agents.map(agent => (
              <div
                key={agent.id}
                className="flex items-center justify-between bg-muted/50 rounded px-2 py-1"
              >
                <span className="text-xs">{agent.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onRemoveAgent(agent.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-4 border-t border-border">
        <Button
          onClick={onRunAlgorithm}
          disabled={!startPos || !endPos || isRunning}
          className="w-full"
          variant="default"
        >
          <Play className="w-4 h-4 mr-2" />
          {isRunning ? 'Running...' : 'Run Algorithm'}
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={onClearPath}
            variant="outline"
            size="sm"
            disabled={isRunning}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Clear Path
          </Button>
          <Button
            onClick={onResetGrid}
            variant="outline"
            size="sm"
            disabled={isRunning}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Status */}
      <div className="text-xs text-muted-foreground space-y-1 pt-2">
        <p>Start: {startPos ? `[${startPos.x}, ${startPos.y}]` : 'Not set'}</p>
        <p>End: {endPos ? `[${endPos.x}, ${endPos.y}]` : 'Not set'}</p>
      </div>
    </div>
  );
};

export default AgentSidebar;
