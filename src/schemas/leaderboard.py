from sqlmodel import SQLModel

class LeaderboardEntry(SQLModel):
    employee_id: int
    name: str
    email: str
    cumulative_score: int
    rank: int