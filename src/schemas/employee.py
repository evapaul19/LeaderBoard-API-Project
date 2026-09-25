from sqlmodel import SQLModel

class EmployeeCreate(SQLModel):
    name: str
    email: str