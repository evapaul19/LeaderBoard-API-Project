import logging
from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func

from src.db.factory import get_session
from src.models.employee import Employee
from src.models.employee_score import EmployeeScore

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/stats")
def get_stats(session: Session = Depends(get_session)):
    logger.info("Fetching dashboard stats")

    total_employees = session.exec(select(func.count(Employee.employee_id))).one()
    total_points_awarded = session.exec(select(func.coalesce(func.sum(Employee.cumulative_score), 0))).one()
    total_activities_completed = session.exec(select(func.count(EmployeeScore.score_id))).one()

    logger.info(
        f"Stats: employees={total_employees}, points={total_points_awarded}, "
        f"activities={total_activities_completed}"
    )

    return {
        "total_employees": total_employees,
        "total_points_awarded": total_points_awarded,
        "total_activities_completed": total_activities_completed,
    }