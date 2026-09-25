from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class EmployeeScore(SQLModel, table=True):
    __tablename__ = "employee_scores"

    score_id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: int = Field(foreign_key="employees.employee_id")
    activity: str
    score: int
    created_at: datetime = Field(
    default=None,
    nullable=False,
    sa_column_kwargs={"server_default": "NOW()"}
)