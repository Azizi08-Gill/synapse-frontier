import React, { useState, useMemo } from 'react';
import { Cell, CellType, AlgorithmType } from '@/hooks/usePathfinder';
import { Agent } from '@/hooks/useAgents';
import { cn } from '@/lib/utils';
import { Zap, MapPin, Box, Truck } from 'lucide-react';

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
  agents,
  onCellClick,
  placementMode,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);

  // Generate deterministic cargo for racks
  const cargoMap = useMemo(() => {
    const map = new Map<string, string>();
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 20; x++) {
        if (Math.random() > 0.5) {
          const type = Math.random();
          if (type > 0.6) map.set(`${x},${y}`, 'cargo-amber');
          else if (type > 0.3) map.set(`${x},${y}`, 'cargo-blue');
          else map.set(`${x},${y}`, 'cargo-green');
        }
      }
    }
    return map;
  }, []);

  const isVisited = (x: number, y: number) =>
    visitedCells.some(cell => cell.x === x && cell.y === y);

  const isPath = (x: number, y: number) =>
    pathCells.some(cell => cell.x === x && cell.y === y);

  const gridSize = 20;

  return (
    <div className="flex flex-col h-full bg-[#1e293b] rounded-sm overflow-hidden relative shadow-2xl">
      {/* 3D Scene Viewport */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden css-3d-scene bg-[#0f172a] cursor-crosshair">

        {/* The 3D Grid Plane */}
        <div
          className="relative grid transition-transform duration-700 ease-in-out css-3d-grid"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            aspectRatio: '1/1',
            width: '600px', // Fixed size for consistent 3D scale
            height: '600px',
          }}
        >
          {grid.map((row, y) =>
            row.map((cell, x) => {
              const visited = isVisited(x, y);
              const path = isPath(x, y);
              const start = startPos?.x === x && startPos?.y === y;
              const end = endPos?.x === x && endPos?.y === y;
              const hovered = hoveredCell?.x === x && hoveredCell?.y === y;
              const cargoClass = cargoMap.get(`${x},${y}`);

              return (
                <div
                  key={`${x}-${y}`}
                  className={cn(
                    "relative floor-cell transition-colors duration-200",
                    cell.type === 'road' && "bg-[#334155] aisle-marking", // Asphalt
                    cell.type === 'empty' && "floor-concrete", // Concrete
                    cell.type === 'obstacle' && "bg-stripes-warning opacity-50",

                    // Highlights
                    // visited && !path && "bg-blue-500/10", // Removed default
                    path && "holo-path",
                    hovered && placementMode !== 'empty' && "bg-white/20"
                  )}
                  onClick={() => onCellClick(x, y, placementMode)}
                  onMouseEnter={() => setHoveredCell({ x, y })}
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  {/* --- 3D RACK OBJECT --- */}
                  {cell.type === 'building' && (
                    <div className="cube pointer-events-none">
                      <div className="cube-face rack-front" />
                      <div className="cube-face rack-side" />
                      <div className="cube-face rack-top relative">
                        {/* Cargo sitting on top */}
                        {cargoClass && <div className={cn("cargo-box", cargoClass)} />}
                        <Box className="absolute w-3 h-3 text-white/30 top-1 left-1" strokeWidth={1} />
                      </div>
                    </div>
                  )}

                  {/* --- HOLOGRAPHIC PATH ARROWS --- */}
                  {path && !start && !end && (
                    <div className="holo-arrow" />
                  )}

                  {/* --- VISITED / THINKING STATE --- */}
                  {visited && !path && !start && !end && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none cell-thinking">
                      <div className="scan-node" />
                    </div>
                  )}

                  {/* --- START / END MARKERS --- */}
                  {start && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <Zap className="text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] animate-pulse" fill="currentColor" />
                    </div>
                  )}
                  {end && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-emerald-500">
                      <MapPin className="drop-shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-bounce" fill="currentColor" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* --- 3D AGV LAYER (Floating above grid) --- */}
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="absolute agv-3d z-50 pointer-events-none"
              style={{
                width: `${100 / gridSize}%`,
                height: `${100 / gridSize}%`,
                left: `${(agent.position.x / gridSize) * 100}%`,
                top: `${(agent.position.y / gridSize) * 100}%`,
                // We don't rotate the div itself for movement to simplify, 
                // we just translate it. 
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className="agv-body shadow-lg">
                  {/* Details */}
                  <div className="absolute top-[2px] left-[2px] text-[6px] font-bold text-black/50 font-mono">AGV</div>
                  <Truck className="w-4 h-4 text-black/40" />
                  <div className="agv-light" />
                  <div className="agv-headlight" />
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* HUD Overlay */}
      <div className="absolute bottom-3 right-3 text-[10px] text-white/30 font-mono text-right pointer-events-none">
        <p>CAM_01 [ISOMETRIC]</p>
        <p>REALTIME_PHYSICS: OFF</p>
      </div>
    </div>
  );
};

export default CityGrid;
