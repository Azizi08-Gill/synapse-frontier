import { useState, useCallback, useRef } from 'react';

export type CellType = 'empty' | 'road' | 'building' | 'obstacle' | 'start' | 'end';
export type AlgorithmType = 'bfs' | 'dfs' | 'astar';

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

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'algorithm';
}

const GRID_SIZE = 20;

// Manhattan distance heuristic - perfect for grid-based city navigation
// where diagonal movement is not allowed
const manhattanDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
};

const getNeighbors = (grid: Cell[][], cell: Cell): Cell[] => {
  const neighbors: Cell[] = [];
  const directions = [
    { x: 0, y: -1 }, // up
    { x: 1, y: 0 },  // right
    { x: 0, y: 1 },  // down
    { x: -1, y: 0 }, // left
  ];

  for (const dir of directions) {
    const newX = cell.x + dir.x;
    const newY = cell.y + dir.y;

    if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE) {
      const neighbor = grid[newY][newX];
      if (neighbor.type !== 'building' && neighbor.type !== 'obstacle') {
        neighbors.push(neighbor);
      }
    }
  }

  return neighbors;
};

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

  function initializeGrid(): Cell[][] {
    const newGrid: Cell[][] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        // Create a city-like pattern with roads and buildings
        let type: CellType = 'road';
        
        // Create building blocks (every 4-5 cells, leave roads)
        if (x % 5 !== 0 && y % 5 !== 0 && x % 5 !== 4 && y % 5 !== 4) {
          // Random chance for buildings in the interior
          if (Math.random() < 0.4) {
            type = 'building';
          }
        }
        
        row.push({
          x,
          y,
          type,
          visited: false,
          isPath: false,
          gCost: Infinity,
          hCost: 0,
          fCost: Infinity,
          parent: null,
        });
      }
      newGrid.push(row);
    }
    return newGrid;
  }

  const resetGrid = useCallback(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
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
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    setGrid(prev => prev.map(row => 
      row.map(cell => ({
        ...cell,
        visited: false,
        isPath: false,
        gCost: Infinity,
        hCost: 0,
        fCost: Infinity,
        parent: null,
      }))
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

  const runBFS = useCallback(async () => {
    if (!startPos || !endPos) return;

    addLog('BFS Algorithm initiated', 'algorithm');
    addLog('BFS explores level by level - guarantees shortest path in unweighted graphs', 'info');

    const visited: { x: number; y: number }[] = [];
    const queue: Cell[] = [];
    const gridCopy = grid.map(row => row.map(cell => ({ ...cell })));
    
    const startCell = gridCopy[startPos.y][startPos.x];
    queue.push(startCell);
    startCell.visited = true;

    let found = false;
    let endCell: Cell | null = null;

    while (queue.length > 0 && !found) {
      const current = queue.shift()!;
      visited.push({ x: current.x, y: current.y });
      
      addLog(`Exploring cell [${current.x}, ${current.y}] | Queue size: ${queue.length}`, 'algorithm');

      if (current.x === endPos.x && current.y === endPos.y) {
        found = true;
        endCell = current;
        addLog('Target found! Reconstructing path...', 'success');
        break;
      }

      const neighbors = getNeighbors(gridCopy, current);
      for (const neighbor of neighbors) {
        if (!neighbor.visited) {
          neighbor.visited = true;
          neighbor.parent = current;
          queue.push(neighbor);
        }
      }
    }

    // Animate visited cells
    for (let i = 0; i < visited.length; i++) {
      await new Promise(resolve => {
        animationRef.current = setTimeout(resolve, speed);
      });
      setVisitedCells(prev => [...prev, visited[i]]);
    }

    // Reconstruct and animate path
    if (found && endCell) {
      const path: { x: number; y: number }[] = [];
      let current: Cell | null = endCell;
      while (current) {
        path.unshift({ x: current.x, y: current.y });
        current = current.parent;
      }
      
      addLog(`Path found! Length: ${path.length} cells`, 'success');
      
      for (let i = 0; i < path.length; i++) {
        await new Promise(resolve => {
          animationRef.current = setTimeout(resolve, speed * 2);
        });
        setPathCells(prev => [...prev, path[i]]);
      }
    } else {
      addLog('No path found - target unreachable', 'warning');
    }

    setIsRunning(false);
  }, [grid, startPos, endPos, speed, addLog]);

  const runDFS = useCallback(async () => {
    if (!startPos || !endPos) return;

    addLog('DFS Algorithm initiated', 'algorithm');
    addLog('DFS dives deep before backtracking - may not find shortest path', 'info');

    const visited: { x: number; y: number }[] = [];
    const stack: Cell[] = [];
    const gridCopy = grid.map(row => row.map(cell => ({ ...cell })));
    
    const startCell = gridCopy[startPos.y][startPos.x];
    stack.push(startCell);

    let found = false;
    let endCell: Cell | null = null;

    while (stack.length > 0 && !found) {
      const current = stack.pop()!;
      
      if (current.visited) continue;
      current.visited = true;
      visited.push({ x: current.x, y: current.y });
      
      addLog(`Exploring cell [${current.x}, ${current.y}] | Stack depth: ${stack.length}`, 'algorithm');

      if (current.x === endPos.x && current.y === endPos.y) {
        found = true;
        endCell = current;
        addLog('Target found! Reconstructing path...', 'success');
        break;
      }

      const neighbors = getNeighbors(gridCopy, current);
      for (const neighbor of neighbors) {
        if (!neighbor.visited) {
          neighbor.parent = current;
          stack.push(neighbor);
        }
      }
    }

    // Animate visited cells
    for (let i = 0; i < visited.length; i++) {
      await new Promise(resolve => {
        animationRef.current = setTimeout(resolve, speed);
      });
      setVisitedCells(prev => [...prev, visited[i]]);
    }

    // Reconstruct and animate path
    if (found && endCell) {
      const path: { x: number; y: number }[] = [];
      let current: Cell | null = endCell;
      while (current) {
        path.unshift({ x: current.x, y: current.y });
        current = current.parent;
      }
      
      addLog(`Path found! Length: ${path.length} cells`, 'success');
      
      for (let i = 0; i < path.length; i++) {
        await new Promise(resolve => {
          animationRef.current = setTimeout(resolve, speed * 2);
        });
        setPathCells(prev => [...prev, path[i]]);
      }
    } else {
      addLog('No path found - target unreachable', 'warning');
    }

    setIsRunning(false);
  }, [grid, startPos, endPos, speed, addLog]);

  const runAStar = useCallback(async () => {
    if (!startPos || !endPos) return;

    addLog('A* Algorithm initiated', 'algorithm');
    addLog('Using Manhattan distance heuristic - optimal for grid-based city navigation', 'info');

    const visited: { x: number; y: number }[] = [];
    const openSet: Cell[] = [];
    const closedSet = new Set<string>();
    const gridCopy = grid.map(row => row.map(cell => ({ ...cell })));
    
    const startCell = gridCopy[startPos.y][startPos.x];
    startCell.gCost = 0;
    startCell.hCost = manhattanDistance(startPos.x, startPos.y, endPos.x, endPos.y);
    startCell.fCost = startCell.gCost + startCell.hCost;
    openSet.push(startCell);

    addLog(`Initial heuristic h(start) = ${startCell.hCost}`, 'algorithm');

    let found = false;
    let endCell: Cell | null = null;

    while (openSet.length > 0 && !found) {
      // Sort by fCost to get the most promising node
      openSet.sort((a, b) => a.fCost - b.fCost);
      const current = openSet.shift()!;
      
      const cellKey = `${current.x},${current.y}`;
      if (closedSet.has(cellKey)) continue;
      closedSet.add(cellKey);
      
      visited.push({ x: current.x, y: current.y });
      
      addLog(`A* evaluating [${current.x}, ${current.y}] | f=${current.fCost.toFixed(1)} g=${current.gCost} h=${current.hCost.toFixed(1)}`, 'algorithm');

      if (current.x === endPos.x && current.y === endPos.y) {
        found = true;
        endCell = current;
        addLog('Optimal path found!', 'success');
        break;
      }

      const neighbors = getNeighbors(gridCopy, current);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        if (closedSet.has(neighborKey)) continue;

        const tentativeGCost = current.gCost + 1;

        if (tentativeGCost < neighbor.gCost) {
          neighbor.parent = current;
          neighbor.gCost = tentativeGCost;
          neighbor.hCost = manhattanDistance(neighbor.x, neighbor.y, endPos.x, endPos.y);
          neighbor.fCost = neighbor.gCost + neighbor.hCost;

          if (!openSet.find(n => n.x === neighbor.x && n.y === neighbor.y)) {
            openSet.push(neighbor);
          }
        }
      }
    }

    // Animate visited cells
    for (let i = 0; i < visited.length; i++) {
      await new Promise(resolve => {
        animationRef.current = setTimeout(resolve, speed);
      });
      setVisitedCells(prev => [...prev, visited[i]]);
    }

    // Reconstruct and animate path
    if (found && endCell) {
      const path: { x: number; y: number }[] = [];
      let current: Cell | null = endCell;
      while (current) {
        path.unshift({ x: current.x, y: current.y });
        current = current.parent;
      }
      
      addLog(`Optimal path length: ${path.length} cells | Total cost: ${endCell.gCost}`, 'success');
      
      for (let i = 0; i < path.length; i++) {
        await new Promise(resolve => {
          animationRef.current = setTimeout(resolve, speed * 2);
        });
        setPathCells(prev => [...prev, path[i]]);
      }
    } else {
      addLog('No path found - target unreachable', 'warning');
    }

    setIsRunning(false);
  }, [grid, startPos, endPos, speed, addLog]);

  const runAlgorithm = useCallback(() => {
    if (!startPos || !endPos || isRunning) return;
    
    clearPath();
    setIsRunning(true);
    
    setTimeout(() => {
      switch (algorithm) {
        case 'bfs':
          runBFS();
          break;
        case 'dfs':
          runDFS();
          break;
        case 'astar':
          runAStar();
          break;
      }
    }, 100);
  }, [algorithm, startPos, endPos, isRunning, clearPath, runBFS, runDFS, runAStar]);

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
