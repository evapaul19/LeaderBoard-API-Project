import logging
from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from src.db.factory import get_session
from src.models.employee import Employee
from src.models.employee_score import EmployeeScore

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/activities")
def get_activities(session: Session = Depends(get_session)):
    logger.info("Fetching global activity feed")

    statement = (
        select(
            EmployeeScore.score_id,
            EmployeeScore.employee_id,
            Employee.name.label("employee_name"),
            EmployeeScore.activity,
            EmployeeScore.score,
            EmployeeScore.created_at,
        )
        .join(Employee, Employee.employee_id == EmployeeScore.employee_id)
        .order_by(EmployeeScore.created_at.desc())
    )

    results = session.exec(statement).all()

    activities = [
        {
            "score_id": row.score_id,
            "employee_id": row.employee_id,
            "employee_name": row.employee_name,
            "activity": row.activity,
            "score": row.score,
            "created_at": row.created_at,
        }
        for row in results
    ]

    logger.info(f"Returned {len(activities)} activity records")
    return activities