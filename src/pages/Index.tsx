import React, { useState } from 'react';
import { usePathfinder, CellType, AlgorithmType } from '@/hooks/usePathfinder';
import { useAlgorithm } from '@/hooks/useAlgorithm';
import { useAgents, AgentType } from '@/hooks/useAgents';
import Header from '@/components/Header';
import CityGrid from '@/components/CityGrid';
import AgentSidebar from '@/components/AgentSidebar';
import AgentLog from '@/components/AgentLog';
import StatsPanel from '@/components/StatsPanel';
import AlgorithmLegend from '@/components/AlgorithmLegend';
import { cn } from '@/lib/utils';

const Index = () => {
  const [numCores, setNumCores] = useState(1);
  const [selectedAlgos, setSelectedAlgos] = useState<AlgorithmType[]>(['bfs', 'dfs', 'astar']);
  const [speed, setSpeed] = useState(50);
  const [weatherEffect, setWeatherEffect] = useState<'clear'>('clear'); // Keeping prop for compatibility but unused

  // Map State (Shared)
  const {
    grid,
    startPos,
    endPos,
    setCellType,
    resetGrid,
  } = usePathfinder();

  // Solver Instances - renamed concept to "Fleet Controllers"
  const solver1 = useAlgorithm(1, grid, startPos, endPos, selectedAlgos[0], speed, 'clear');
  const solver2 = useAlgorithm(2, grid, startPos, endPos, selectedAlgos[1], speed, 'clear');
  const solver3 = useAlgorithm(3, grid, startPos, endPos, selectedAlgos[2], speed, 'clear');

  const solvers = [solver1, solver2, solver3];

  const activeSolvers = solvers.slice(0, numCores);
  const isRunning = activeSolvers.some(s => s.isRunning);

  const handleRunAll = () => {
    activeSolvers.forEach(s => s.runAlgorithm());
  };

  const handleClearAll = () => {
    solvers.forEach(s => s.clearPath());
  };

  const clearAllLogs = () => {
    solvers.forEach(s => s.clearLogs());
  };

  // Merge logs from active solvers
  const allLogs = activeSolvers
    .flatMap(s => s.logs)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const {
    agents,
    spawnAgent,
    removeAgent,
  } = useAgents();

  const [placementMode, setPlacementMode] = useState<CellType>('start');

  const handleCellClick = (x: number, y: number, type: CellType) => {
    if (isRunning) return;
    setCellType(x, y, type);
  };

  const handleSpawnAgent = (type: AgentType, position: { x: number; y: number }) => {
    spawnAgent(type, position);
  };

  return (
    <div className="min-h-screen bg-background neo-grid-pattern text-foreground font-mono">
      {/* Structural overlaid grid lines for industrial feel */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10"
        style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, #333 25%, #333 26%, transparent 27%, transparent 74%, #333 75%, #333 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, #333 25%, #333 26%, transparent 27%, transparent 74%, #333 75%, #333 76%, transparent 77%, transparent)', backgroundSize: '100px 100px' }}
      />

      <div className="relative z-10 flex flex-col h-screen">
        <Header />

        <main className="flex-1 flex overflow-hidden p-4 gap-4">
          {/* Left Sidebar - Control Room */}
          <AgentSidebar
            numCores={numCores}
            setNumCores={setNumCores}
            selectedAlgos={selectedAlgos}
            setSelectedAlgos={setSelectedAlgos}
            speed={speed}
            setSpeed={setSpeed}
            placementMode={placementMode}
            setPlacementMode={setPlacementMode}
            onRunAlgorithm={handleRunAll}
            onResetGrid={resetGrid}
            onClearPath={handleClearAll}
            isRunning={isRunning}
            startPos={startPos}
            endPos={endPos}
            agents={agents}
            onSpawnAgent={handleSpawnAgent}
            onRemoveAgent={removeAgent}
            weatherEffect={'clear'}
            setWeatherEffect={() => { }}
            pathCosts={activeSolvers.map(s => s.pathCost)}
          />

          {/* Center - Warehouse Floor */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <div className={cn(
              "flex-1 min-h-0 grid gap-4 transition-all duration-500 ease-in-out",
              numCores === 1 ? "grid-cols-1" :
                numCores === 2 ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-3"
            )}>
              {activeSolvers.map((solver, index) => (
                <div key={index} className="flex flex-col gap-2 min-h-0 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-between px-2 py-1 bg-card border border-border rounded-t-sm">
                    <div className="flex items-center gap-2">
                      {/* Activity Status Light */}
                      <div className={cn("w-3 h-3 rounded-full border border-black/50 shadow-inner",
                        solver.isRunning ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                      )} />
                      <span className="text-xs font-bold text-foreground tracking-wider">
                        FLEET CONTROLLER 0{index + 1} // <span className="text-primary">{selectedAlgos[index].toUpperCase()}</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono bg-background/50 px-2 py-0.5 rounded">
                      {solver.pathCost > 0 ? (
                        <span className="text-primary font-bold">COST: {solver.pathCost}</span>
                      ) : solver.isRunning ? (
                        <span className="text-amber-500">CALCULATING ROUTE...</span>
                      ) : 'STANDBY'}
                    </span>
                  </div>

                  <div className="flex-1 min-h-0 overflow-hidden border border-t-0 border-border bg-card relative shadow-inner">
                    <CityGrid
                      grid={grid}
                      visitedCells={solver.visitedCells}
                      pathCells={solver.pathCells}
                      startPos={startPos}
                      endPos={endPos}
                      algorithm={selectedAlgos[index]}
                      agents={agents}
                      onCellClick={handleCellClick}
                      placementMode={placementMode}
                      weatherEffect={'clear'}
                    />
                  </div>
                </div>
              ))}
            </div>

            <AlgorithmLegend algorithm={selectedAlgos[0]} />
          </div>

          {/* Right Sidebar - Analytics */}
          <div className="w-80 flex flex-col gap-4">
            <StatsPanel
              cores={activeSolvers.map((s, i) => ({
                id: i + 1,
                algorithm: selectedAlgos[i],
                visitedCount: s.visitedCells.length,
                pathLength: s.pathCells.length,
                pathCost: s.pathCost, // Include the path cost here
                isRunning: s.isRunning,
              }))}
              agents={agents}
              weatherEffect={'clear'}
            />

            <div className="flex-1 min-h-0">
              <AgentLog logs={allLogs} onClear={clearAllLogs} />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="h-8 bg-card border-t border-border flex items-center justify-between px-4 text-[10px] uppercase font-mono text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>System: <span className="text-emerald-500">ONLINE</span></span>
            <span>Grid: 20x20</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Synapse Frontier Logistics Engine v2.0</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
