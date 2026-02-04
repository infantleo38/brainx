from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from typing import Optional

class ClassSessionBase(BaseModel):
    batch_id: int
    course_id: int
    teacher_id: UUID
    start_time: datetime
    end_time: datetime
    meeting_link: Optional[str] = None
    is_recorded: bool = False

class ClassSessionCreate(ClassSessionBase):
    pass

class ClassSessionUpdate(BaseModel):
    batch_id: Optional[int] = None
    course_id: Optional[int] = None
    teacher_id: Optional[UUID] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    meeting_link: Optional[str] = None
    is_recorded: Optional[bool] = None

from app.schemas.course import Course

class ClassSession(ClassSessionBase):
    id: int
    course: Optional[Course] = None

    model_config = ConfigDict(from_attributes=True)
