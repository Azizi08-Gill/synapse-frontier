import { useState, useCallback, useRef } from 'react';
import { Cell, AlgorithmType, LogEntry } from './usePathfinder';

export interface SolverState {
    visitedCells: { x: number; y: number }[];
    pathCells: { x: number; y: number }[];
    pathCost: number;
    isRunning: boolean;
    logs: LogEntry[];
}

export const useAlgorithm = (
    id: number,
    grid: Cell[][],
    startPos: { x: number; y: number } | null,
    endPos: { x: number; y: number } | null,
    algorithm: AlgorithmType,
    speed: number,
    weatherEffect: 'clear' | 'rain' | 'snow'
) => {
    const [visitedCells, setVisitedCells] = useState<{ x: number; y: number }[]>([]);
    const [pathCells, setPathCells] = useState<{ x: number; y: number }[]>([]);
    const [pathCost, setPathCost] = useState<number>(0);
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);

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
        setLogs(prev => [...prev.slice(-20), { timestamp, message, type }]); // Keep fewer logs per instance
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
                addLog(`Path Found! Complexity: ${data.complexity}`, 'success');
                const path = data.path;

                const weatherPenalty = weatherEffect === 'rain' ? 2 : weatherEffect === 'snow' ? 4 : 0;
                const baseWeight = 1;
                const calculatedCost = path.length > 0 ? (path.length - 1) * (baseWeight + weatherPenalty) : 0;
                setPathCost(calculatedCost);

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
    }, [speed, addLog, weatherEffect]);

    const clearPath = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setVisitedCells([]);
        setPathCells([]);
        setPathCost(0);
        setIsRunning(false);
        queueRef.current = [];
        processingRef.current = false;
    }, []);

    const runAlgorithm = useCallback(() => {
        if (!startPos || !endPos || isRunning) return;

        clearPath();
        setIsRunning(true);
        addLog(`Starting ${algorithm.toUpperCase()}...`, 'algorithm');

        setTimeout(() => {
            // Create a dedicated socket connection
            const ws = new WebSocket('ws://localhost:8000/ws/solve');
            wsRef.current = ws;

            ws.onopen = () => {
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
                console.error(`Solver ${id} Error:`, error);
                addLog('Connection Failed', 'warning');
                setIsRunning(false);
            };
        }, 100);
    }, [grid, startPos, endPos, algorithm, isRunning, clearPath, addLog, id, processQueue]);

    return {
        visitedCells,
        pathCells,
        pathCost,
        isRunning,
        logs,
        runAlgorithm,
        clearPath,
        clearLogs
    };
};
