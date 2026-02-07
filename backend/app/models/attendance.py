from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, UniqueConstraint, Date
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import enum
from app.db.base import Base

class AttendanceStatus(str, enum.Enum):
    present = "present"
    absent = "absent"
    late = "late"
    excused = "excused"

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("class_sessions.id"), nullable=True)  # Nullable for date-based attendance
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    date = Column(Date, nullable=True)  # For date-based attendance without sessions
    status = Column(Enum(AttendanceStatus), default=AttendanceStatus.present, nullable=False)
    remarks = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    session = relationship("ClassSession", backref="attendances")
    student = relationship("User", foreign_keys=[student_id], backref="attendance_records")
    batch = relationship("Batch", backref="attendances")
    course = relationship("Course", backref="attendances")

    # Unique constraint: either (session_id, student_id) or (batch_id, date, student_id)
    # Using separate constraints since one of session_id or batch_id+date will be used
    __table_args__ = (
        UniqueConstraint('session_id', 'student_id', name='uq_attendance_session_student'),
        UniqueConstraint('batch_id', 'date', 'student_id', name='uq_attendance_batch_date_student'),
    )
