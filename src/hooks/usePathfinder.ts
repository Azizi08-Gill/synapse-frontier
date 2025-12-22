import { useState, useCallback } from 'react';

export type CellType = 'empty' | 'road' | 'building' | 'obstacle' | 'start' | 'end';
export type AlgorithmType = 'bfs' | 'dfs' | 'astar' | 'ucs' | 'greedy' | 'bidirectional' | 'beam' | 'iddfs';

export interface Cell {
  x: number;
  y: number;
  type: CellType;
  visited: boolean; // Keep for legacy/compat, though controlled by overlay now
  isPath: boolean;
  gCost: number;
  hCost: number;
  fCost: number;
  parent: Cell | null;
}

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'algorithm';
}

const GRID_SIZE = 20;

export const usePathfinder = () => {
  const [grid, setGrid] = useState<Cell[][]>(() => initializeGrid());
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [endPos, setEndPos] = useState<{ x: number; y: number } | null>(null);

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
    setGrid(initializeGrid());
    setStartPos(null);
    setEndPos(null);
  }, []);

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
    } else if (type === 'end') {
      if (endPos) {
        setGrid(prev => {
          const newGrid = [...prev];
          newGrid[endPos.y][endPos.x] = { ...newGrid[endPos.y][endPos.x], type: 'road' };
          return newGrid;
        });
      }
      setEndPos({ x, y });
    }

    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      newGrid[y][x] = { ...newGrid[y][x], type };
      return newGrid;
    });
  }, [startPos, endPos]);

  return {
    grid,
    startPos,
    endPos,
    setCellType,
    resetGrid,
  };
};
