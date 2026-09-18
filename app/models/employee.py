from sqlmodel import SQLModel, Field
from typing import Optional

class Employee(SQLModel, table=True):
    __tablename__ = "employees"

    employee_id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str
    cumulative_score: int = 0