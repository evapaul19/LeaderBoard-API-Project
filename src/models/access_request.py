from datetime import datetime
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


class AccessStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class AccessRequest(SQLModel, table=True):
    __tablename__ = "access_requests"

    id: Optional[int] = Field(default=None, primary_key=True)
    clerk_user_id: str = Field(unique=True)
    name: str
    email: str
    status: str = AccessStatus.PENDING.value

    created_at: Optional[datetime] = Field(
        default=None,
        nullable=False,
        sa_column_kwargs={"server_default": "NOW()"},
    )

    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None