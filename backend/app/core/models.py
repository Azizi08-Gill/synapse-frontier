from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Tuple

class Position(BaseModel):
    x: int
    y: int

    def __hash__(self):
        return hash((self.x, self.y))
    
    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

    def to_tuple(self) -> Tuple[int, int]:
        return (self.x, self.y)

class Cell(BaseModel):
    x: int
    y: int
    type: Literal['empty', 'road', 'building', 'obstacle', 'start', 'end']
    weight: int = 1  # 1 for road, higher for 'Tolls'
    weather_intensity: float = 0.0  # 0.0 to 1.0

class GridState(BaseModel):
    grid: List[List[Cell]]
    start_pos: Position = Field(..., alias="startPos")
    end_pos: Position = Field(..., alias="endPos")
    algorithm: str
