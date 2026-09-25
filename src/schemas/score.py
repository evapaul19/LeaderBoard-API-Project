from sqlmodel import SQLModel
from src.constants import ActivityType

class ScoreCreate(SQLModel):
    activity: ActivityType