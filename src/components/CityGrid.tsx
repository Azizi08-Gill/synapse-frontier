import React, { useState } from 'react';
import { Cell, CellType, AlgorithmType } from '@/hooks/usePathfinder';
import { Agent } from '@/hooks/useAgents';
import { cn } from '@/lib/utils';

interface CityGridProps {
  grid: Cell[][];
  visitedCells: { x: number; y: number }[];
  pathCells: { x: number; y: number }[];
  startPos: { x: number; y: number } | null;
  endPos: { x: number; y: number } | null;
  algorithm: AlgorithmType;
  agents: Agent[];
  onCellClick: (x: number, y: number, type: CellType) => void;
  placementMode: CellType;
  weatherEffect: 'clear' | 'rain' | 'snow';
}

const CityGrid: React.FC<CityGridProps> = ({
  grid,
  visitedCells,
  pathCells,
  startPos,
  endPos,
  algorithm,
  agents,
  onCellClick,
  placementMode,
  weatherEffect,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);

  const isVisited = (x: number, y: number) =>
    visitedCells.some(cell => cell.x === x && cell.y === y);

  const isPath = (x: number, y: number) =>
    pathCells.some(cell => cell.x === x && cell.y === y);

  const isStart = (x: number, y: number) =>
    startPos?.x === x && startPos?.y === y;

  const isEnd = (x: number, y: number) =>
    endPos?.x === x && endPos?.y === y;

  const hasAgent = (x: number, y: number) =>
    agents.find(agent => agent.position.x === x && agent.position.y === y);

  const getVisitedClass = () => {
    switch (algorithm) {
      case 'bfs': return 'cell-visited-bfs';
      case 'dfs': return 'cell-visited-dfs';
      case 'astar': return 'cell-visited-astar';
      case 'ucs': return 'cell-visited-ucs';
      case 'greedy': return 'cell-visited-greedy';
      case 'bidirectional': return 'cell-visited-bidirectional';
      case 'beam': return 'cell-visited-beam';
      case 'iddfs': return 'cell-visited-iddfs';
      default: return '';
    }
  };

  const getPathColor = () => {
    switch (algorithm) {
      case 'bfs': return 'bg-primary';
      case 'dfs': return 'bg-secondary';
      case 'astar': return 'bg-accent';
      case 'ucs': return 'bg-accent';
      case 'greedy': return 'bg-[hsl(var(--neon-amber))]';
      case 'bidirectional': return 'bg-[hsl(var(--neon-emerald))]';
      case 'beam': return 'bg-[hsl(var(--neon-pink))]';
      case 'iddfs': return 'bg-primary';
      default: return 'bg-primary';
    }
  };

  return (
    <div className="relative neo-panel p-4 overflow-hidden">
      {/* Weather overlay */}
      {weatherEffect !== 'clear' && (
        <div className={cn(
          "absolute inset-0 pointer-events-none z-10",
          weatherEffect === 'rain' && "bg-primary/5",
          weatherEffect === 'snow' && "bg-foreground/5"
        )}>
          {weatherEffect === 'rain' && (
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 50 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-px bg-primary/50"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    height: '10px',
                    animation: `fall ${0.5 + Math.random() * 0.5}s linear infinite`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grid header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm text-primary neo-text-glow tracking-widest">
          SECTOR MAP
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span>20×20 Grid</span>
        </div>
      </div>

      {/* The grid */}
      <div
        className="grid gap-px bg-grid-line/50 rounded-lg overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(20, 1fr)`,
          aspectRatio: '1/1',
        }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => {
            const agent = hasAgent(x, y);
            const visited = isVisited(x, y);
            const path = isPath(x, y);
            const start = isStart(x, y);
            const end = isEnd(x, y);
            const hovered = hoveredCell?.x === x && hoveredCell?.y === y;

            return (
              <div
                key={`${x}-${y}`}
                className={cn(
                  "relative aspect-square cursor-pointer transition-all duration-150",
                  "hover:brightness-125 hover:z-10",
                  // Base cell types
                  cell.type === 'road' && "bg-grid-road",
                  cell.type === 'building' && "bg-grid-building",
                  cell.type === 'obstacle' && "bg-grid-obstacle",
                  cell.type === 'empty' && "bg-grid-cell",
                  // Algorithm visualization
                  visited && !path && !start && !end && getVisitedClass(),
                  path && !start && !end && cn(getPathColor(), "cell-path"),
                  // Start and end markers
                  start && "cell-start",
                  end && "cell-end",
                  // Agent presence
                  agent && "cell-agent",
                  // Hover effect for placement
                  hovered && placementMode !== 'empty' && "ring-1 ring-primary",
                )}
                onClick={() => onCellClick(x, y, placementMode)}
                onMouseEnter={() => setHoveredCell({ x, y })}
                onMouseLeave={() => setHoveredCell(null)}
              >
                {/* Start marker */}
                {start && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-accent-foreground animate-pulse" />
                  </div>
                )}

                {/* End marker */}
                {end && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rotate-45 bg-secondary-foreground" />
                  </div>
                )}

                {/* Agent indicator */}
                {agent && (
                  <div
                    className="absolute inset-1 rounded-full"
                    style={{ backgroundColor: agent.color }}
                  />
                )}

                {/* Path glow effect */}
                {path && (
                  <div className={cn(
                    "absolute inset-0",
                    algorithm === 'bfs' && "shadow-[inset_0_0_10px_hsl(var(--primary)/0.5)]",
                    algorithm === 'dfs' && "shadow-[inset_0_0_10px_hsl(var(--secondary)/0.5)]",
                    (algorithm === 'astar' || algorithm === 'ucs' || algorithm === 'bidirectional') && "shadow-[inset_0_0_10px_hsl(var(--accent)/0.5)]",
                    algorithm === 'greedy' && "shadow-[inset_0_0_10px_hsl(var(--neon-amber)/0.5)]",
                    algorithm === 'beam' && "shadow-[inset_0_0_10px_hsl(var(--neon-pink)/0.5)]",
                    algorithm === 'iddfs' && "shadow-[inset_0_0_10px_hsl(var(--primary)/0.5)]",
                  )} />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Grid coordinates hint */}
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>X: 0-19</span>
        <span>Y: 0-19</span>
      </div>
    </div>
  );
};

export default CityGrid;
