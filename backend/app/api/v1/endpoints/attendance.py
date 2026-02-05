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
    Submit or update attendance for a session (Bulk).
    Only Teachers and Admins can perform this action.
    """
    if current_user.role not in [UserRole.teacher, UserRole.admin]:
        raise HTTPException(status_code=403, detail="Not authorized to mark attendance")
    
    # We could add a check here to ensure the teacher is actually assigned to this session/batch
    # But for now, we trust the role check.

    records = attendance_in.records
    # Ensure all records have the session_id from the payload
    # (Schema separates them, but CRUD expects objects)
    
    # Convert AttendanceCreate objects from the input list
    # The input `records` is List[AttendanceCreate], but AttendanceCreate requires session_id.
    # The Schema `AttendanceBulkCreate` defined `records: List[AttendanceCreate]`.
    # Let's verify `AttendanceCreate` schema again. It has matching fields.
    # Actually, the bulk input might often just be student_id and status to save bandwidth,
    # but reusing AttendanceCreate is fine as long as frontend sends it.
    # Let's assume frontend sends full objects or we inject session_id.
    
    # Correction: If frontend sends just student_id/status, we need a simplified schema or inject session_id here.
    # Our `AttendanceCreate` requires `session_id`.
    # If the payload `records` already has it, good. If not, validation fails before here.
    # Ideally, `AttendanceBulkCreate.records` should be a simpler schema sans session_id,
    # but let's stick to the current definition and expect frontend to send it.
    
    return await crud_attendance.upsert_bulk(db, session_id=attendance_in.session_id, records=records)

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
