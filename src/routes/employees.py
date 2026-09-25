import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError

from src.db.factory import get_session
from src.models.employee import Employee
from src.models.employee_score import EmployeeScore
from src.schemas.employee import EmployeeCreate
from src.schemas.score import ScoreCreate
from src.constants import ACTIVITY_POINTS

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/employees")
def get_employees(session: Session = Depends(get_session)):
    logger.info("Fetching all employees")
    employees = session.exec(select(Employee)).all()
    logger.info(f"Returned {len(employees)} employees")
    return employees


@router.post("/employees", response_model=Employee)
def create_employee(employee_in: EmployeeCreate, session: Session = Depends(get_session)):
    logger.info(f"Creating employee with email={employee_in.email}")

    new_employee = Employee(name=employee_in.name, email=employee_in.email)
    session.add(new_employee)

    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        logger.warning(f"Duplicate email rejected: {employee_in.email}")
        raise HTTPException(status_code=400, detail="An employee with this email already exists")

    session.refresh(new_employee)
    logger.info(f"Created employee_id={new_employee.employee_id}")
    return new_employee


@router.post("/employees/{employee_id}/scores", response_model=EmployeeScore)
def create_score(
    employee_id: int,
    score_in: ScoreCreate,
    session: Session = Depends(get_session),
):
    logger.info(f"Recording activity '{score_in.activity}' for employee_id={employee_id}")

    employee = session.get(Employee, employee_id)
    if not employee:
        logger.warning(f"Employee not found: employee_id={employee_id}")
        raise HTTPException(status_code=404, detail="Employee not found")

    points = ACTIVITY_POINTS[score_in.activity]

    new_score = EmployeeScore(
        employee_id=employee_id,
        activity=score_in.activity.value,
        score=points,
    )
    session.add(new_score)
    session.commit()
    session.refresh(new_score)

    logger.info(f"Recorded score_id={new_score.score_id}, points={points}, employee_id={employee_id}")
    return new_score
@router.get("/employees/{employee_id}/scores", response_model=list[EmployeeScore])
def get_employee_scores(employee_id: int, session: Session = Depends(get_session)):
    logger.info(f"Fetching scores for employee_id={employee_id}")

    employee = session.get(Employee, employee_id)
    if not employee:
        logger.warning(f"Employee not found: employee_id={employee_id}")
        raise HTTPException(status_code=404, detail="Employee not found")

    statement = (
        select(EmployeeScore)
        .where(EmployeeScore.employee_id == employee_id)
        .order_by(EmployeeScore.created_at.desc())
    )
    scores = session.exec(statement).all()

    logger.info(f"Returned {len(scores)} score records for employee_id={employee_id}")
    return scores
