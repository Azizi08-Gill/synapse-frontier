import { useState, useCallback, useRef } from 'react';

export type CellType = 'empty' | 'road' | 'building' | 'obstacle' | 'start' | 'end';
export type AlgorithmType = 'bfs' | 'dfs' | 'astar' | 'ucs' | 'greedy' | 'bidirectional' | 'beam' | 'iddfs';

export interface Cell {
  x: number;
  y: number;
  type: CellType;
  visited: boolean;
  isPath: boolean;
  gCost: number; // Cost from start to this cell
  hCost: number; // Heuristic cost from this cell to end
  fCost: number; // gCost + hCost
  parent: Cell | null;
}

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'algorithm';
}

const GRID_SIZE = 20;

export interface PathfinderState {
  grid: Cell[][];
  visitedCells: { x: number; y: number }[];
  pathCells: { x: number; y: number }[];
  isRunning: boolean;
  algorithm: AlgorithmType;
  speed: number;
  startPos: { x: number; y: number } | null;
  endPos: { x: number; y: number } | null;
}
export const usePathfinder = () => {
  const [grid, setGrid] = useState<Cell[][]>(() => initializeGrid());
  const [visitedCells, setVisitedCells] = useState<{ x: number; y: number }[]>([]);
  const [pathCells, setPathCells] = useState<{ x: number; y: number }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('astar');
  const [speed, setSpeed] = useState(50);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [endPos, setEndPos] = useState<{ x: number; y: number } | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const queueRef = useRef<any[]>([]);
  const processingRef = useRef(false);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    setLogs(prev => [...prev.slice(-50), { timestamp, message, type }]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;

    while (queueRef.current.length > 0) {
      const data = queueRef.current.shift();

      if (data.type === 'visited_batch') {
        const nodes = data.nodes;
        for (const node of nodes) {
          setVisitedCells(prev => [...prev, node]);
          await new Promise(r => setTimeout(r, speed / 2));
        }
      } else if (data.type === 'path_found') {
        addLog(`Target Acquired! Path Complexity: ${data.complexity} nodes`, 'success');
        const path = data.path;
        for (const node of path) {
          setPathCells(prev => [...prev, node]);
          await new Promise(r => setTimeout(r, speed));
        }
      } else if (data.type === 'complete') {
        setIsRunning(false);
        if (wsRef.current) wsRef.current.close();
      } else if (data.error) {
        addLog(`Error: ${data.error}`, 'warning');
        setIsRunning(false);
      }
    }

    processingRef.current = false;
  }, [speed, addLog]);

  function initializeGrid(): Cell[][] {
    const newGrid: Cell[][] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        let type: CellType = 'road';
        if (x % 5 !== 0 && y % 5 !== 0 && x % 5 !== 4 && y % 5 !== 4) {
          if (Math.random() < 0.4) {
            type = 'building';
          }
        }
        row.push({
          x, y, type, visited: false, isPath: false, gCost: Infinity, hCost: 0, fCost: Infinity, parent: null,
        });
      }
      newGrid.push(row);
    }
    return newGrid;
  }

  const resetGrid = useCallback(() => {
    if (animationRef.current) clearTimeout(animationRef.current);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setGrid(initializeGrid());
    setVisitedCells([]);
    setPathCells([]);
    setIsRunning(false);
    setStartPos(null);
    setEndPos(null);
    clearLogs();
    addLog('Grid reset. Ready for new simulation.', 'info');
  }, [addLog, clearLogs]);

  const clearPath = useCallback(() => {
    if (animationRef.current) clearTimeout(animationRef.current);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setGrid(prev => prev.map(row =>
      row.map(cell => ({ ...cell, visited: false, isPath: false, gCost: Infinity, hCost: 0, fCost: Infinity, parent: null }))
    ));
    setVisitedCells([]);
    setPathCells([]);
    setIsRunning(false);
    addLog('Path cleared. Algorithm ready to run again.', 'info');
  }, [addLog]);

  const setCellType = useCallback((x: number, y: number, type: CellType) => {
    if (type === 'start') {
      if (startPos) {
        setGrid(prev => {
          const newGrid = [...prev];
          newGrid[startPos.y][startPos.x] = { ...newGrid[startPos.y][startPos.x], type: 'road' };
          return newGrid;
        });
      }
      setStartPos({ x, y });
      addLog(`Start position set at [${x}, ${y}]`, 'success');
    } else if (type === 'end') {
      if (endPos) {
        setGrid(prev => {
          const newGrid = [...prev];
          newGrid[endPos.y][endPos.x] = { ...newGrid[endPos.y][endPos.x], type: 'road' };
          return newGrid;
        });
      }
      setEndPos({ x, y });
      addLog(`End position set at [${x}, ${y}]`, 'success');
    }

    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      newGrid[y][x] = { ...newGrid[y][x], type };
      return newGrid;
    });
  }, [startPos, endPos, addLog]);

  const runBackendAlgorithm = useCallback(() => {
    if (!startPos || !endPos) return;

    addLog(`${algorithm.toUpperCase()} stream initiated via Neural Core...`, 'algorithm');

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Reset Queue
    queueRef.current = [];
    processingRef.current = false;

    const ws = new WebSocket('ws://localhost:8000/ws/solve');
    wsRef.current = ws;

    ws.onopen = () => {
      addLog('Uplink established. Transmitting grid state...', 'info');
      ws.send(JSON.stringify({
        grid,
        startPos,
        endPos,
        algorithm
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      queueRef.current.push(data);
      processQueue();
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      addLog('Neural Core Uplink Failed. Check backend status.', 'warning');
      setIsRunning(false);
    };

    ws.onclose = () => {
      // Connection closed
    };

  }, [grid, startPos, endPos, algorithm, addLog, processQueue]);

  const runAlgorithm = useCallback(() => {
    if (!startPos || !endPos || isRunning) return;

    clearPath();
    setIsRunning(true);

    // Slight delay to allow UI to update before heavy animation starts
    setTimeout(() => {
      runBackendAlgorithm();
    }, 100);
  }, [startPos, endPos, isRunning, clearPath, runBackendAlgorithm]);

  return {
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
    addLog,
    clearLogs,
  };
};
