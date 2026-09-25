from sqlmodel import SQLModel
from datetime import datetime
from typing import Optional

class AccessRequestOut(SQLModel):
    id: int
    clerk_user_id: str
    name: str
    email: str
    status: str
    created_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None