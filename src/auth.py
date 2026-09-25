import logging
from functools import lru_cache
from typing import Annotated

from clerk_backend_api import AuthenticateRequestOptions, Clerk, authenticate_request
from clerk_backend_api.security.types import RequestState
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session, select

from src.config import settings
from src.db.factory import get_session
from src.models.employee import Employee

logger = logging.getLogger(__name__)

http_bearer = HTTPBearer(auto_error=False)


def require_auth(
    request: Request,
    _creds: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(http_bearer)
    ] = None,
) -> RequestState:

    state = authenticate_request(
        request,
        AuthenticateRequestOptions(
            secret_key=settings.clerk_secret_key,
            jwt_key=settings.clerk_jwt_key,
            authorized_parties=settings.clerk_authorized_parties,
            accepts_token=["session_token"],
        ),
    )

    logger.info(
        f"[AUTH DEBUG] is_signed_in={state.is_signed_in} reason={state.reason}"
    )

    if not state.is_signed_in:
        raise HTTPException(
            status_code=401,
            detail=state.reason.name if state.reason else "unauthorized",
            headers={"WWW-Authenticate": "Bearer"},
        )

    logger.info(
        f"[AUTH DEBUG] sub={state.payload.get('sub')}"
    )

    return state


def require_admin(
    state: Annotated[RequestState, Depends(require_auth)],
    session: Session = Depends(get_session),
) -> Employee:

    employee = session.exec(
        select(Employee).where(
            Employee.clerk_user_id == state.payload["sub"]
        )
    ).first()

    if not employee or employee.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return employee


@lru_cache
def get_clerk() -> Clerk:
    return Clerk(bearer_auth=settings.clerk_secret_key)