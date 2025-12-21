# Synapse Frontier: Neo-Kyoto Urban Intelligence System

## Operation Profile
**Synapse Frontier** is a futuristic, cyberpunk-themed Web Application designed to simulate urban intelligence scenarios. It features a "Neo-Kyoto" digital twin city grid where autonomous agents operate and pathfinding algorithms are visualized in real-time.

The system is split into two neural cores:
1.  **Frontend (React + Vite)**: Handles the holographic visualization and user interaction.
2.  **Backend (Python + FastAPI)**: The "Neural Core" that processes complex algorithms (BFS, DFS, A*).

## System Requirements
*   Node.js & npm
*   Python 3.8+

## Initialization Sequence

### 1. Ignite the Backend (Neural Core)
The backend calculates optimal paths and agent logic.

```bash
cd backend
pip install -r requirements.txt
python main.py
```
*Server will listen on `http://localhost:8000`*

### 2. Launch the Frontend (Holographic Interface)
In a new terminal:

```bash
npm install
npm run dev
```
*Interface will launch at `http://localhost:8080` (or similar)*

## Technologies Deployed
*   **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion (Neo-UI).
*   **Backend**: Python, FastAPI.
*   **Algorithms**: Breadth-First Search, Depth-First Search, A* Search.

## Logic Flow
1.  User sets **Start** and **End** points on the grid.
2.  User selects an algorithm (e.g., A*) and clicks "Run".
3.  Frontend captures the grid state (walls, obstacles) and transmits it to the Python Backend.
4.  Python Backend computes the exploration order and the optimal path.
5.  Results are beamed back to the Frontend for step-by-step visualization.

## Neural Status
*   **System**: Online
*   **Sector**: 7G
*   **Protocol**: Active
