from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from uuid import UUID
from app.models.attendance import AttendanceStatus
from app.schemas.user import UserResponse
from app.schemas.class_session import ClassSession

class AttendanceBase(BaseModel):
    status: AttendanceStatus
    remarks: Optional[str] = None

class AttendanceCreate(AttendanceBase):
    student_id: UUID
    session_id: int

class AttendanceUpdate(BaseModel):
    status: Optional[AttendanceStatus] = None
    remarks: Optional[str] = None

class Attendance(AttendanceBase):
    id: int
    student_id: UUID
    session_id: int
    batch_id: Optional[int] = None
    course_id: Optional[int] = None
    created_at: datetime
    student: Optional[UserResponse] = None
    session: Optional[ClassSession] = None

    class Config:
        from_attributes = True

class AttendanceBulkCreate(BaseModel):
    session_id: int
    records: List[AttendanceCreate]
