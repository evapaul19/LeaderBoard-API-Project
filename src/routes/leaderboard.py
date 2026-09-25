import logging
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from sqlalchemy import func

from src.db.factory import get_session
from src.models.employee import Employee
from src.schemas.leaderboard import LeaderboardEntry

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
def get_leaderboard(session: Session = Depends(get_session)):
    logger.info("Fetching leaderboard")

    statement = select(
        Employee.employee_id,
        Employee.name,
        Employee.email,
        Employee.cumulative_score,
        func.rank().over(order_by=Employee.cumulative_score.desc()).label("rank"),
    ).order_by(Employee.cumulative_score.desc())

    results = session.exec(statement).all()

    leaderboard = [
        LeaderboardEntry(
            employee_id=row.employee_id,
            name=row.name,
            email=row.email,
            cumulative_score=row.cumulative_score,
            rank=row.rank,
        )
        for row in results
    ]

    logger.info(f"Returned {len(leaderboard)} leaderboard entries")
    return leaderboard