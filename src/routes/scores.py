from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from src.db.factory import get_session
from src.models.employee_score import EmployeeScore
from src.models.employee import Employee

router = APIRouter(prefix="/scores", tags=["Scores"])


@router.get("")
def get_all_scores(session: Session = Depends(get_session)):
    statement = (
        select(EmployeeScore, Employee.name)
        .join(Employee, Employee.employee_id == EmployeeScore.employee_id)
        .order_by(EmployeeScore.created_at.desc())
    )

    results = session.exec(statement).all()

    return [
        {
            "score_id": score.score_id,
            "employee_id": score.employee_id,
            "employee_name": employee_name,
            "activity": score.activity,
            "score": score.score,
            "created_at": score.created_at,
        }
        for score, employee_name in results
    ]