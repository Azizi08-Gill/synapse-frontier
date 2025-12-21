import heapq
import collections
from typing import List, Set, Dict, Tuple, Generator, Optional
from .models import GridState, Position, Cell

class SearchEngine:
    def __init__(self, state: GridState):
        self.grid = state.grid
        self.start = state.start_pos
        self.end = state.end_pos
        self.width = len(self.grid[0])
        self.height = len(self.grid)

    def get_neighbors(self, pos: Position) -> List[Tuple[Position, int]]:
        """Returns valid neighbors and their move costs."""
        neighbors = []
        directions = [(0, -1), (1, 0), (0, 1), (-1, 0)]  # Up, Right, Down, Left

        for dx, dy in directions:
            nx, ny = pos.x + dx, pos.y + dy

            if 0 <= nx < self.width and 0 <= ny < self.height:
                cell = self.grid[ny][nx]
                if cell.type not in ('building', 'obstacle'):
                    # Calculate cost: Base weight + Weather penalty
                    cost = cell.weight + int(cell.weather_intensity * 5)
                    neighbors.append((Position(x=nx, y=ny), cost))
        return neighbors

    def manhattan(self, a: Position, b: Position) -> int:
        return abs(a.x - b.x) + abs(a.y - b.y)

    def bfs(self) -> Generator[dict, None, None]:
        queue = collections.deque([self.start])
        visited = {self.start.to_tuple()}
        parent = {}
        
        while queue:
            current = queue.popleft()
            yield {'type': 'visit', 'node': current.dict()}

            if current == self.end:
                yield from self.reconstruct_path(parent, current)
                return

            for neighbor, _ in self.get_neighbors(current):
                if neighbor.to_tuple() not in visited:
                    visited.add(neighbor.to_tuple())
                    parent[neighbor.to_tuple()] = current
                    queue.append(neighbor)

    def dfs(self) -> Generator[dict, None, None]:
        stack = [self.start]
        visited = set()
        parent = {}

        while stack:
            current = stack.pop()
            
            if current.to_tuple() in visited:
                continue
            
            visited.add(current.to_tuple())
            yield {'type': 'visit', 'node': current.dict()}

            if current == self.end:
                yield from self.reconstruct_path(parent, current)
                return

            for neighbor, _ in self.get_neighbors(current):
                if neighbor.to_tuple() not in visited:
                    parent[neighbor.to_tuple()] = current
                    stack.append(neighbor)

    def ucs(self) -> Generator[dict, None, None]:
        pq = [(0, 0, self.start)] 
        visited = {} 
        parent = {}
        counter = 0

        while pq:
            cost, _, current = heapq.heappop(pq)
            
            if current.to_tuple() in visited and visited[current.to_tuple()] <= cost:
                continue
            
            visited[current.to_tuple()] = cost
            yield {'type': 'visit', 'node': current.dict()}

            if current == self.end:
                yield from self.reconstruct_path(parent, current)
                return

            for neighbor, move_cost in self.get_neighbors(current):
                new_cost = cost + move_cost
                if neighbor.to_tuple() not in visited or new_cost < visited[neighbor.to_tuple()]:
                    parent[neighbor.to_tuple()] = current
                    counter += 1
                    heapq.heappush(pq, (new_cost, counter, neighbor))

    def a_star(self) -> Generator[dict, None, None]:
        counter = 0
        h_start = self.manhattan(self.start, self.end)
        pq = [(h_start, 0, counter, self.start)]
        g_scores = {self.start.to_tuple(): 0}
        parent = {}

        while pq:
            _, g, _, current = heapq.heappop(pq)
            
            yield {'type': 'visit', 'node': current.dict()}

            if current == self.end:
                yield from self.reconstruct_path(parent, current)
                return

            for neighbor, move_cost in self.get_neighbors(current):
                tentative_g = g + move_cost
                
                if neighbor.to_tuple() not in g_scores or tentative_g < g_scores[neighbor.to_tuple()]:
                    g_scores[neighbor.to_tuple()] = tentative_g
                    f = tentative_g + self.manhattan(neighbor, self.end)
                    parent[neighbor.to_tuple()] = current
                    counter += 1
                    heapq.heappush(pq, (f, tentative_g, counter, neighbor))

    def greedy_best_first(self) -> Generator[dict, None, None]:
        counter = 0
        h_start = self.manhattan(self.start, self.end)
        pq = [(h_start, counter, self.start)]
        visited = {self.start.to_tuple()}
        parent = {}

        while pq:
            _, _, current = heapq.heappop(pq)
            yield {'type': 'visit', 'node': current.dict()}

            if current == self.end:
                yield from self.reconstruct_path(parent, current)
                return

            for neighbor, _ in self.get_neighbors(current):
                if neighbor.to_tuple() not in visited:
                    visited.add(neighbor.to_tuple())
                    parent[neighbor.to_tuple()] = current
                    h = self.manhattan(neighbor, self.end)
                    counter += 1
                    heapq.heappush(pq, (h, counter, neighbor))

    def reconstruction_iterative_deepening(self) -> Generator[dict, None, None]:
        depth = 0
        while True:
            visited_at_depth = {}
            stack = [(self.start, 0)] # (node, current_depth)
            parent = {}
            cutoff_reached = False
            
            while stack:
                current, d = stack.pop()
                
                if current.to_tuple() in visited_at_depth and visited_at_depth[current.to_tuple()] <= d:
                    continue
                
                visited_at_depth[current.to_tuple()] = d
                yield {'type': 'visit', 'node': current.dict()} 
                
                if current == self.end:
                    yield from self.reconstruct_path(parent, current)
                    return

                if d < depth:
                    for neighbor, _ in self.get_neighbors(current):
                         if neighbor.to_tuple() not in visited_at_depth or visited_at_depth[neighbor.to_tuple()] > d + 1:
                            parent[neighbor.to_tuple()] = current
                            stack.append((neighbor, d + 1))
                else:
                    cutoff_reached = True

            if not cutoff_reached:
                return 

            depth += 1
            if depth > 100: 
                return 

    def bidirectional(self) -> Generator[dict, None, None]:
        q_start = collections.deque([self.start])
        q_end = collections.deque([self.end])
        
        visited_start = {self.start.to_tuple(): self.start} 
        visited_end = {self.end.to_tuple(): self.end}
        
        parent_start = {}
        parent_end = {}
        
        while q_start and q_end:
            if q_start:
                curr_s = q_start.popleft()
                yield {'type': 'visit', 'node': curr_s.dict(), 'source': 'start'}
                
                if curr_s.to_tuple() in visited_end:
                    yield from self.reconstruct_bidirectional(parent_start, parent_end, curr_s, visited_end[curr_s.to_tuple()])
                    return

                for neighbor, _ in self.get_neighbors(curr_s):
                    if neighbor.to_tuple() not in visited_start:
                        visited_start[neighbor.to_tuple()] = neighbor
                        parent_start[neighbor.to_tuple()] = curr_s
                        q_start.append(neighbor)

            if q_end:
                curr_e = q_end.popleft()
                yield {'type': 'visit', 'node': curr_e.dict(), 'source': 'end'}
                
                if curr_e.to_tuple() in visited_start:
                     yield from self.reconstruct_bidirectional(parent_start, parent_end, visited_start[curr_e.to_tuple()], curr_e)
                     return

                for neighbor, _ in self.get_neighbors(curr_e):
                    if neighbor.to_tuple() not in visited_end:
                        visited_end[neighbor.to_tuple()] = neighbor
                        parent_end[neighbor.to_tuple()] = curr_e
                        q_end.append(neighbor)

    def beam_search(self, beam_width=3) -> Generator[dict, None, None]:
        current_level = [self.start]
        visited = {self.start.to_tuple()}
        parent = {}
        
        while current_level:
            next_level_candidates = []
            
            for node in current_level:
                yield {'type': 'visit', 'node': node.dict()}
                if node == self.end:
                    yield from self.reconstruct_path(parent, node)
                    return
                
                for neighbor, _ in self.get_neighbors(node):
                    if neighbor.to_tuple() not in visited:
                        visited.add(neighbor.to_tuple())
                        parent[neighbor.to_tuple()] = node
                        h = self.manhattan(neighbor, self.end)
                        next_level_candidates.append((h, neighbor))
            
            next_level_candidates.sort(key=lambda x: x[0])
            current_level = [n for _, n in next_level_candidates[:beam_width]]

    def reconstruct_path(self, parent: dict, current: Position) -> Generator[dict, None, None]:
        path = []
        while current.to_tuple() in parent:
            path.append(current)
            current = parent[current.to_tuple()]
        path.append(current)
        path.reverse()
        
        yield {
            'type': 'path', 
            'path': [p.dict() for p in path],
            'complexity': len(parent)
        }

    def reconstruct_bidirectional(self, p_start, p_end, meet_node_s, meet_node_e):
        path_s = []
        curr = meet_node_s
        while curr.to_tuple() in p_start:
            path_s.append(curr)
            curr = p_start[curr.to_tuple()]
        path_s.append(curr)
        path_s.reverse()
        
        path_e = []
        curr = meet_node_e
        while curr.to_tuple() in p_end:
            if curr != meet_node_s: 
                 path_e.append(curr)
            curr = p_end[curr.to_tuple()]
        if curr != meet_node_s:
            path_e.append(curr)

        full_path = path_s + path_e
        yield {
            'type': 'path',
            'path': [p.dict() for p in full_path],
            'complexity': len(p_start) + len(p_end)
        }
