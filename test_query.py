from sqlmodel import Session, select
from database import engine
from models import Employee

with Session(engine) as session:
    statement = select(Employee)
    employees = session.exec(statement).all()

    for emp in employees:
        print(emp)