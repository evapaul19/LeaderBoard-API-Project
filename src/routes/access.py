import logging
from datetime import datetime, timezone
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException
from clerk_backend_api import Clerk
from clerk_backend_api.security.types import RequestState
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from src.auth import require_auth, require_admin, get_clerk
from src.db.factory import get_session
from src.models.employee import Employee
from src.models.access_request import AccessRequest
from src.schemas.access_request import AccessRequestOut

logger = logging.getLogger(__name__)
router = APIRouter()


def _clerk_profile(clerk: Clerk, clerk_user_id: str):
    user = clerk.users.get(user_id=clerk_user_id)
    email = next(
        (a.email_address for a in user.email_addresses or []
         if a.id == user.primary_email_address_id),
        None,
    )
    name = f"{user.first_name or ''} {user.last_name or ''}".strip() or None
    return email, name


@router.get("/me")
def get_me(
    state: Annotated[RequestState, Depends(require_auth)],
    session: Session = Depends(get_session),
    clerk: Clerk = Depends(get_clerk),
):
    clerk_user_id = state.payload["sub"]
    logger.info(f"[ME DEBUG] clerk_user_id={clerk_user_id}")
    email, name = _clerk_profile(clerk, clerk_user_id)

    employee = session.exec(
        select(Employee).where(Employee.clerk_user_id == clerk_user_id)
    ).first()
    if employee:
        return {"clerk_user_id": clerk_user_id, "email": email, "name": name,
                "status": "APPROVED", "role": employee.role}

    access_request = session.exec(
        select(AccessRequest).where(AccessRequest.clerk_user_id == clerk_user_id)
    ).first()
    if access_request:
        return {"clerk_user_id": clerk_user_id, "email": email, "name": name,
                "status": access_request.status, "role": None}

    return {"clerk_user_id": clerk_user_id, "email": email, "name": name,
            "status": "NOT_REQUESTED", "role": None}


@router.post("/access-requests", response_model=AccessRequestOut)
def create_access_request(
    state: Annotated[RequestState, Depends(require_auth)],
    session: Session = Depends(get_session),
    clerk: Clerk = Depends(get_clerk),
):
    clerk_user_id = state.payload["sub"]
    logger.info(
    f"[ACCESS DEBUG] creating request for clerk_user_id={clerk_user_id}"
)

    if session.exec(select(Employee).where(Employee.clerk_user_id == clerk_user_id)).first():
        raise HTTPException(status_code=400, detail="Already an approved employee")

    existing = session.exec(
        select(AccessRequest).where(AccessRequest.clerk_user_id == clerk_user_id)
    ).first()
    if existing:
        return existing

    email, name = _clerk_profile(clerk, clerk_user_id)
    new_request = AccessRequest(
        clerk_user_id=clerk_user_id,
        name=name or "Unknown",
        email=email or f"{clerk_user_id}@unknown.local",
    )
    session.add(new_request)
    session.commit()
    session.refresh(new_request)
    logger.info(f"Access request created for clerk_user_id={clerk_user_id}")
    return new_request


@router.get("/access-requests/me", response_model=AccessRequestOut)
def get_my_access_request(
    state: Annotated[RequestState, Depends(require_auth)],
    session: Session = Depends(get_session),
):
    req = session.exec(
        select(AccessRequest).where(AccessRequest.clerk_user_id == state.payload["sub"])
    ).first()
    if not req:
        raise HTTPException(status_code=404, detail="No access request found")
    return req


@router.get("/admin/access-requests", response_model=list[AccessRequestOut])
def list_access_requests(
    admin: Annotated[Employee, Depends(require_admin)],
    session: Session = Depends(get_session),
    status: Optional[str] = None,
):
    statement = select(AccessRequest)
    if status:
        statement = statement.where(AccessRequest.status == status)
    statement = statement.order_by(AccessRequest.created_at.desc())
    return session.exec(statement).all()


@router.post("/admin/access-requests/{request_id}/approve", response_model=AccessRequestOut)
def approve_access_request(
    request_id: int,
    admin: Annotated[Employee, Depends(require_admin)],
    session: Session = Depends(get_session),
):
    req = session.get(AccessRequest, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Access request not found")
    if req.status != "PENDING":
        raise HTTPException(status_code=400, detail=f"Request is already {req.status}")

    new_employee = Employee(name=req.name, email=req.email, clerk_user_id=req.clerk_user_id)
    session.add(new_employee)

    req.status = "APPROVED"
    req.reviewed_at = datetime.now(timezone.utc)
    req.reviewed_by = admin.clerk_user_id
    session.add(req)

    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=400, detail="An employee with this email already exists")

    session.refresh(req)
    logger.info(f"Access request {request_id} approved by {admin.clerk_user_id}")
    return req


@router.post("/admin/access-requests/{request_id}/reject", response_model=AccessRequestOut)
def reject_access_request(
    request_id: int,
    admin: Annotated[Employee, Depends(require_admin)],
    session: Session = Depends(get_session),
):
    req = session.get(AccessRequest, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Access request not found")
    if req.status != "PENDING":
        raise HTTPException(status_code=400, detail=f"Request is already {req.status}")

    req.status = "REJECTED"
    req.reviewed_at = datetime.now(timezone.utc)
    req.reviewed_by = admin.clerk_user_id
    session.add(req)
    session.commit()
    session.refresh(req)
    logger.info(f"Access request {request_id} rejected by {admin.clerk_user_id}")
    return req