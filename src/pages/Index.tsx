import React, { useState } from 'react';
import { usePathfinder, CellType } from '@/hooks/usePathfinder';
import { useAgents, AgentType } from '@/hooks/useAgents';
import Header from '@/components/Header';
import CityGrid from '@/components/CityGrid';
import AgentSidebar from '@/components/AgentSidebar';
import AgentLog from '@/components/AgentLog';
import StatsPanel from '@/components/StatsPanel';
import AlgorithmLegend from '@/components/AlgorithmLegend';

const Index = () => {
  const {
    grid,
    visitedCells,
    pathCells,
    isRunning,
    algorithm,
    speed,
    startPos,
    endPos,
    logs,
    setAlgorithm,
    setSpeed,
    setCellType,
    resetGrid,
    clearPath,
    runAlgorithm,
    clearLogs,
  } = usePathfinder();

  const {
    agents,
    spawnAgent,
    removeAgent,
  } = useAgents();

  const [placementMode, setPlacementMode] = useState<CellType>('start');
  const [weatherEffect, setWeatherEffect] = useState<'clear' | 'rain' | 'snow'>('clear');

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
            algorithm={algorithm}
            setAlgorithm={setAlgorithm}
            speed={speed}
            setSpeed={setSpeed}
            placementMode={placementMode}
            setPlacementMode={setPlacementMode}
            onRunAlgorithm={runAlgorithm}
            onResetGrid={resetGrid}
            onClearPath={clearPath}
            isRunning={isRunning}
            startPos={startPos}
            endPos={endPos}
            agents={agents}
            onSpawnAgent={handleSpawnAgent}
            onRemoveAgent={removeAgent}
            weatherEffect={weatherEffect}
            setWeatherEffect={setWeatherEffect}
          />

          {/* Center - Main Grid */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <div className="flex-1 min-h-0">
              <CityGrid
                grid={grid}
                visitedCells={visitedCells}
                pathCells={pathCells}
                startPos={startPos}
                endPos={endPos}
                algorithm={algorithm}
                agents={agents}
                onCellClick={handleCellClick}
                placementMode={placementMode}
                weatherEffect={weatherEffect}
              />
            </div>
            
            <AlgorithmLegend algorithm={algorithm} />
          </div>

          {/* Right Sidebar - Stats & Logs */}
          <div className="w-80 flex flex-col gap-4">
            <StatsPanel
              algorithm={algorithm}
              visitedCount={visitedCells.length}
              pathLength={pathCells.length}
              agents={agents}
              weatherEffect={weatherEffect}
              isRunning={isRunning}
            />
            
            <div className="flex-1 min-h-0">
              <AgentLog logs={logs} onClear={clearLogs} />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="h-10 neo-panel rounded-none border-x-0 border-b-0 flex items-center justify-center">
          <p className="text-xs text-muted-foreground font-mono">
            NEO-KYOTO URBAN INTELLIGENCE SYSTEM • SECTOR 7G • 
            <span className="text-primary ml-2">SIMULATION ACTIVE</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
