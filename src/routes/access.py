import logging
from datetime import datetime, timezone
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException
from clerk_backend_api import Clerk
from clerk_backend_api.security.types import RequestState
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from src.auth import require_auth, require_admin, get_clerk
from src.config import settings
from src.db.factory import get_session
from src.models.employee import Employee
from src.models.access_request import AccessRequest
from src.schemas.access_request import AccessRequestOut


logger = logging.getLogger(__name__)
router = APIRouter()


def _clerk_profile(clerk: Clerk, clerk_user_id: str):
    """Get the authenticated user's email and name from Clerk."""

    user = clerk.users.get(user_id=clerk_user_id)

    email = next(
        (
            address.email_address
            for address in user.email_addresses or []
            if address.id == user.primary_email_address_id
        ),
        None,
    )

    name = (
        f"{user.first_name or ''} {user.last_name or ''}".strip()
        or None
    )

    return email, name


def _is_configured_admin(email: Optional[str]) -> bool:
    """
    Check whether the email is explicitly configured as an admin.

    Only exact email addresses from ALLOWED_EMAILS can receive
    automatic admin access.
    """

    if not email:
        return False

    normalized_email = email.lower().strip()

    allowed_emails = {
        item.strip().lower()
        for item in settings.allowed_emails.split(",")
        if item.strip()
    }

    return normalized_email in allowed_emails


def _is_allowed_domain(email: Optional[str]) -> bool:
    """
    Check whether the email belongs to one of the configured
    automatically approved domains.

    Example:
        employee@cloudraft.io -> True
    """

    if not email:
        return False

    normalized_email = email.lower().strip()

    allowed_domains = {
        item.strip().lower().lstrip("@")
        for item in settings.allowed_email_domains.split(",")
        if item.strip()
    }

    return any(
        normalized_email.endswith(f"@{domain}")
        for domain in allowed_domains
    )


@router.get("/me")
def get_me(
    state: Annotated[RequestState, Depends(require_auth)],
    session: Session = Depends(get_session),
    clerk: Clerk = Depends(get_clerk),
):
    """
    Resolve the authenticated user's application access.

    Access rules:

    1. Configured admin email:
       - Automatically approved
       - Admin role

    2. Configured domain (e.g. @cloudraft.io):
       - Automatically approved
       - Normal user role

    3. Everyone else:
       - Existing access-request workflow
    """

    clerk_user_id = state.payload["sub"]

    logger.info(
        f"[ME DEBUG] clerk_user_id={clerk_user_id}"
    )

    email, name = _clerk_profile(
        clerk,
        clerk_user_id,
    )

    is_admin = _is_configured_admin(email)
    is_allowed_domain = _is_allowed_domain(email)

    # Check whether the user already exists as an employee.
    employee = session.exec(
        select(Employee).where(
            Employee.clerk_user_id == clerk_user_id
        )
    ).first()

    # ---------------------------------------------------------
    # EXISTING EMPLOYEE
    # ---------------------------------------------------------

    if employee:

        # Only the explicitly configured admin email can have
        # the admin role.
        if is_admin and employee.role != "admin":
            employee.role = "admin"

            session.add(employee)
            session.commit()
            session.refresh(employee)

            logger.info(
                f"Promoted configured admin to admin role: {email}"
            )

        return {
            "clerk_user_id": clerk_user_id,
            "email": email,
            "name": name,
            "status": "APPROVED",
            "role": employee.role,
        }

    # ---------------------------------------------------------
    # CONFIGURED ADMIN
    # ---------------------------------------------------------

    if is_admin:

        new_employee = Employee(
            name=name or "Unknown",
            email=email,
            clerk_user_id=clerk_user_id,
            role="admin",
        )

        session.add(new_employee)
        session.commit()
        session.refresh(new_employee)

        logger.info(
            f"Automatically approved admin: {email}"
        )

        return {
            "clerk_user_id": clerk_user_id,
            "email": email,
            "name": name,
            "status": "APPROVED",
            "role": "admin",
        }

    # ---------------------------------------------------------
    # AUTOMATIC NORMAL USER
    # ---------------------------------------------------------

    if is_allowed_domain:

        new_employee = Employee(
            name=name or "Unknown",
            email=email,
            clerk_user_id=clerk_user_id,
            role="user",
        )

        session.add(new_employee)
        session.commit()
        session.refresh(new_employee)

        logger.info(
            f"Automatically approved CloudRaft user: {email}"
        )

        return {
            "clerk_user_id": clerk_user_id,
            "email": email,
            "name": name,
            "status": "APPROVED",
            "role": "user",
        }

    # ---------------------------------------------------------
    # EXISTING ACCESS REQUEST
    # ---------------------------------------------------------

    access_request = session.exec(
        select(AccessRequest).where(
            AccessRequest.clerk_user_id == clerk_user_id
        )
    ).first()

    if access_request:

        return {
            "clerk_user_id": clerk_user_id,
            "email": email,
            "name": name,
            "status": access_request.status,
            "role": None,
        }

    # ---------------------------------------------------------
    # NO EMPLOYEE / NO ACCESS REQUEST
    # ---------------------------------------------------------

    return {
        "clerk_user_id": clerk_user_id,
        "email": email,
        "name": name,
        "status": "NOT_REQUESTED",
        "role": None,
    }


@router.post(
    "/access-requests",
    response_model=AccessRequestOut,
)
def create_access_request(
    state: Annotated[RequestState, Depends(require_auth)],
    session: Session = Depends(get_session),
    clerk: Clerk = Depends(get_clerk),
):
    """Create an access request for a non-automatically-approved user."""

    clerk_user_id = state.payload["sub"]

    logger.info(
        f"[ACCESS DEBUG] creating request for "
        f"clerk_user_id={clerk_user_id}"
    )

    email, name = _clerk_profile(
        clerk,
        clerk_user_id,
    )

    # Automatically approved users should never need to create
    # an access request.
    if _is_configured_admin(email):
        raise HTTPException(
            status_code=400,
            detail="This account already has automatic admin access",
        )

    if _is_allowed_domain(email):
        raise HTTPException(
            status_code=400,
            detail="This account already has automatic access",
        )

    # Check whether the user is already an employee.
    employee = session.exec(
        select(Employee).where(
            Employee.clerk_user_id == clerk_user_id
        )
    ).first()

    if employee:
        raise HTTPException(
            status_code=400,
            detail="Already an approved employee",
        )

    # Return the existing request instead of creating a duplicate.
    existing = session.exec(
        select(AccessRequest).where(
            AccessRequest.clerk_user_id == clerk_user_id
        )
    ).first()

    if existing:
        return existing

    new_request = AccessRequest(
        clerk_user_id=clerk_user_id,
        name=name or "Unknown",
        email=email or f"{clerk_user_id}@unknown.local",
    )

    session.add(new_request)
    session.commit()
    session.refresh(new_request)

    logger.info(
        f"Access request created for clerk_user_id={clerk_user_id}"
    )

    return new_request


@router.get(
    "/access-requests/me",
    response_model=AccessRequestOut,
)
def get_my_access_request(
    state: Annotated[RequestState, Depends(require_auth)],
    session: Session = Depends(get_session),
):
    """Get the authenticated user's access request."""

    req = session.exec(
        select(AccessRequest).where(
            AccessRequest.clerk_user_id == state.payload["sub"]
        )
    ).first()

    if not req:
        raise HTTPException(
            status_code=404,
            detail="No access request found",
        )

    return req


@router.get(
    "/admin/access-requests",
    response_model=list[AccessRequestOut],
)
def list_access_requests(
    admin: Annotated[Employee, Depends(require_admin)],
    session: Session = Depends(get_session),
    status: Optional[str] = None,
):
    """List access requests for administrators."""

    statement = select(AccessRequest)

    if status:
        statement = statement.where(
            AccessRequest.status == status
        )

    statement = statement.order_by(
        AccessRequest.created_at.desc()
    )

    return session.exec(statement).all()


@router.post(
    "/admin/access-requests/{request_id}/approve",
    response_model=AccessRequestOut,
)
def approve_access_request(
    request_id: int,
    admin: Annotated[Employee, Depends(require_admin)],
    session: Session = Depends(get_session),
):
    """Approve an access request and create a normal user."""

    req = session.get(
        AccessRequest,
        request_id,
    )

    if not req:
        raise HTTPException(
            status_code=404,
            detail="Access request not found",
        )

    if req.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail=f"Request is already {req.status}",
        )

    # Manually approved users are normal users.
    new_employee = Employee(
        name=req.name,
        email=req.email,
        clerk_user_id=req.clerk_user_id,
        role="user",
    )

    session.add(new_employee)

    req.status = "APPROVED"
    req.reviewed_at = datetime.now(timezone.utc)
    req.reviewed_by = admin.clerk_user_id

    session.add(req)

    try:
        session.commit()

    except IntegrityError:
        session.rollback()

        raise HTTPException(
            status_code=400,
            detail="An employee with this email already exists",
        )

    session.refresh(req)

    logger.info(
        f"Access request {request_id} approved "
        f"by {admin.clerk_user_id}"
    )

    return req


@router.post(
    "/admin/access-requests/{request_id}/reject",
    response_model=AccessRequestOut,
)
def reject_access_request(
    request_id: int,
    admin: Annotated[Employee, Depends(require_admin)],
    session: Session = Depends(get_session),
):
    """Reject an access request."""

    req = session.get(
        AccessRequest,
        request_id,
    )

    if not req:
        raise HTTPException(
            status_code=404,
            detail="Access request not found",
        )

    if req.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail=f"Request is already {req.status}",
        )

    req.status = "REJECTED"
    req.reviewed_at = datetime.now(timezone.utc)
    req.reviewed_by = admin.clerk_user_id

    session.add(req)
    session.commit()
    session.refresh(req)

    logger.info(
        f"Access request {request_id} rejected "
        f"by {admin.clerk_user_id}"
    )

    return req