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
  const [weatherEffect, setWeatherEffect] = useState<'clear' | 'rain' | 'snow'>('clear');
  const [numCores, setNumCores] = useState(1);
  const [selectedAlgos, setSelectedAlgos] = useState<AlgorithmType[]>(['bfs', 'dfs', 'astar']);
  const [speed, setSpeed] = useState(50);

  // Map State (Shared)
  // usePathfinder is now purely a Grid Editor hook
  const {
    grid,
    startPos,
    endPos,
    setCellType,
    resetGrid,
  } = usePathfinder();

  // Solver Instances - We instantiate 3 "Cores"
  // Even if not active, hooks must be called unconditionally
  const solver1 = useAlgorithm(1, grid, startPos, endPos, selectedAlgos[0], speed, weatherEffect);
  const solver2 = useAlgorithm(2, grid, startPos, endPos, selectedAlgos[1], speed, weatherEffect);
  const solver3 = useAlgorithm(3, grid, startPos, endPos, selectedAlgos[2], speed, weatherEffect);

  const solvers = [solver1, solver2, solver3];

  // Active solvers based on numCores
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
    <div className="min-h-screen bg-background neo-grid-pattern">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        <Header />

        <main className="flex-1 flex overflow-hidden p-4 gap-4">
          {/* Left Sidebar - Controls */}
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
            weatherEffect={weatherEffect}
            setWeatherEffect={setWeatherEffect}
            pathCosts={activeSolvers.map(s => s.pathCost)}
          />

          {/* Center - Main Grid(s) */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <div className={cn(
              "flex-1 min-h-0 grid gap-4 transition-all duration-500 ease-in-out",
              numCores === 1 ? "grid-cols-1" :
                numCores === 2 ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-3"
            )}>
              {activeSolvers.map((solver, index) => (
                <div key={index} className="flex flex-col gap-2 min-h-0 animate-in fade-in zoom-in-95 duration-300">
                  {numCores > 1 && (
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", index === 0 ? "bg-primary shadow-[0_0_8px_hsl(var(--primary))]" : index === 1 ? "bg-secondary shadow-[0_0_8px_hsl(var(--secondary))]" : "bg-accent shadow-[0_0_8px_hsl(var(--accent))]")} />
                        <span className="text-xs font-mono text-foreground uppercase tracking-wider">
                          Core 0{index + 1} // <span className={cn(
                            index === 0 ? "text-primary" : index === 1 ? "text-secondary" : "text-accent"
                          )}>{selectedAlgos[index].toUpperCase()}</span>
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {solver.pathCost > 0 ? (
                          <span className="neo-text-glow text-foreground font-bold">COST: {solver.pathCost}</span>
                        ) : solver.isRunning ? (
                          <span className="animate-pulse">PROCESSING...</span>
                        ) : 'READY'}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 min-h-0 overflow-hidden rounded-lg border border-border/50 relative shadow-lg bg-background/50 backdrop-blur-sm">
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
                      weatherEffect={weatherEffect}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Legend - Only show for the first algo or a general legend?
                AlgorithmLegend actually highlights colors based on 'algorithm' prop.
                If we pass 'bfs', it highlights BFS colors.
                Ideally we show legend for active algorithms or just general.
                Let's stick to showing Core 1's legend for simplicity or fix it to be static.
            */}
            <AlgorithmLegend algorithm={selectedAlgos[0]} />
          </div>

          {/* Right Sidebar - Stats & Logs */}
          <div className="w-80 flex flex-col gap-4">
            <StatsPanel
              cores={activeSolvers.map((s, i) => ({
                id: i + 1,
                algorithm: selectedAlgos[i],
                visitedCount: s.visitedCells.length,
                pathLength: s.pathCells.length,
                isRunning: s.isRunning,
              }))}
              agents={agents}
              weatherEffect={weatherEffect}
            />

            <div className="flex-1 min-h-0">
              <AgentLog logs={allLogs} onClear={clearAllLogs} />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="h-10 neo-panel rounded-none border-x-0 border-b-0 flex items-center justify-center">
          <p className="text-xs text-muted-foreground font-mono flex items-center gap-2">
            NEO-KYOTO URBAN INTELLIGENCE SYSTEM • SECTOR 7G •
            <span className="text-primary">SIMULATION ACTIVE</span>
            {numCores > 1 && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-accent animate-pulse">// PARALLEL PROCESSING ENABLED</span>
              </>
            )}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
