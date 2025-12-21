from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.models import GridState
from app.core.search_engine import SearchEngine
import json

router = APIRouter()

@router.websocket("/ws/solve")
async def websocket_solve(websocket: WebSocket):
    await websocket.accept()
    print("Client Connected to Neural Core") 
    try:
        while True:
            # Receive Grid State
            data = await websocket.receive_json()
            
            # Parse into Pydantic model
            try:
                state = GridState(**data)
            except Exception as e:
                print(f"Validation Error: {e}")
                await websocket.send_json({"error": f"Invalid Data: {str(e)}"})
                continue
                
            engine = SearchEngine(state)
            algorithm = state.algorithm.lower()
            print(f"Executing Algorithm: {algorithm}")
            
            solver = None
            if algorithm == 'bfs':
                solver = engine.bfs()
            elif algorithm == 'dfs':
                solver = engine.dfs()
            elif algorithm == 'astar':
                solver = engine.a_star()
            elif algorithm == 'ucs' or algorithm == 'dijkstra':
                solver = engine.ucs()
            elif algorithm == 'greedy':
                solver = engine.greedy_best_first()
            elif algorithm == 'bidirectional' or algorithm == 'bi-dir':
                solver = engine.bidirectional()
            elif algorithm == 'beam':
                solver = engine.beam_search()
            elif algorithm == 'iddfs':
                solver = engine.reconstruction_iterative_deepening()
            
            # Fallback
            if not solver:
                solver = engine.bfs()
                
            # Stream results
            visited_buffer = []
            
            for step in solver:
                if step['type'] == 'visit':
                    visited_buffer.append(step['node'])
                    if len(visited_buffer) >= 5: 
                         await websocket.send_json({
                             "type": "visited_batch",
                             "nodes": visited_buffer
                         })
                         visited_buffer = []
                
                elif step['type'] == 'path':
                    # Flush buffer
                    if visited_buffer:
                        await websocket.send_json({
                             "type": "visited_batch",
                             "nodes": visited_buffer
                         })
                    
                    await websocket.send_json({
                        "type": "path_found",
                        "path": step['path'],
                        "complexity": step.get('complexity', 0)
                    })
                    break
            
            await websocket.send_json({"type": "complete"})
            
    except WebSocketDisconnect:
        print("Neural Core Client Disconnected")
    except Exception as e:
        print(f"Neural Core Error: {e}")
        try:
             await websocket.send_json({"error": str(e)})
        except:
            pass
