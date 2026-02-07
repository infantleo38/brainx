from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.api import deps
from app.crud.crud_attendance import attendance as crud_attendance
from app.schemas.attendance import Attendance, AttendanceBulkCreate, AttendanceCreate
from app.models.user import User, UserRole

router = APIRouter()

@router.post("/bulk", response_model=List[Attendance])
async def create_bulk_attendance(
    *,
    db: AsyncSession = Depends(deps.get_db),
    attendance_in: AttendanceBulkCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Submit or update attendance for a session or date (Bulk).
    Only Teachers and Admins can perform this action.
    
    For session-based attendance: Provide session_id
    For date-based attendance: Provide batch_id and date (no session_id)
    """
    if current_user.role not in [UserRole.teacher, UserRole.admin]:
        raise HTTPException(status_code=403, detail="Not authorized to mark attendance")
    
    # Validate that we have either session_id or batch_id+date
    if attendance_in.session_id is None and (attendance_in.batch_id is None or attendance_in.date is None):
        raise HTTPException(
            status_code=400, 
            detail="Either session_id or both batch_id and date must be provided"
        )

    records = attendance_in.records
    
    return await crud_attendance.upsert_bulk(
        db, 
        session_id=attendance_in.session_id, 
        batch_id=attendance_in.batch_id,
        date=attendance_in.date,
        records=records
    )

@router.get("/session/{session_id}", response_model=List[Attendance])
async def read_session_attendance(
    *,
    db: AsyncSession = Depends(deps.get_db),
    session_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get attendance for a specific session.
    """
    return await crud_attendance.get_by_session(db, session_id=session_id)

@router.get("/student/{student_id}", response_model=List[Attendance])
async def read_student_attendance(
    *,
    db: AsyncSession = Depends(deps.get_db),
    student_id: UUID,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get attendance history for a student.
    """
    # Students can only view their own attendance
    if current_user.role == UserRole.student and str(current_user.id) != str(student_id):
        raise HTTPException(status_code=403, detail="Not authorized to view other students' attendance")
        
    return await crud_attendance.get_by_student(db, student_id=student_id, skip=skip, limit=limit)
