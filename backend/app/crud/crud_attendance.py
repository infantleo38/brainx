from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.dialects.postgresql import insert
from app.models.attendance import Attendance
from app.models.class_session import ClassSession
from app.models.course import Course
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate

class CRUDAttendance:
    async def get_by_session(self, db: AsyncSession, *, session_id: int) -> List[Attendance]:
        result = await db.execute(
            select(Attendance)
            .options(selectinload(Attendance.student))
            .options(
                selectinload(Attendance.session)
                .selectinload(ClassSession.course)
                .options(
                    selectinload(Course.badge),
                    selectinload(Course.provider)
                )
            )
            .filter(Attendance.session_id == session_id)
        )
        return result.scalars().all()

    async def get_by_student(self, db: AsyncSession, *, student_id: str, skip: int = 0, limit: int = 100) -> List[Attendance]:
         # Convert string UUID to proper format if needed, though sqlalchemy handles it usually
        result = await db.execute(
            select(Attendance)
            .options(
                selectinload(Attendance.session)
                .selectinload(ClassSession.course)
                .options(
                    selectinload(Course.badge),
                    selectinload(Course.provider)
                )
            )
            .filter(Attendance.student_id == student_id)
            .offset(skip).limit(limit)
            .order_by(Attendance.created_at.desc())
        )
        return result.scalars().all()

    async def upsert_bulk(self, db: AsyncSession, *, session_id: Optional[int], batch_id: Optional[int] = None, date = None, records: List[AttendanceCreate]) -> List[Attendance]:
        # Determine if this is session-based or date-based attendance
        is_date_based = session_id is None and batch_id is not None and date is not None
        
        session_obj = None
        if session_id:
            # Fetch session details to get batch_id and course_id
            session_result = await db.execute(select(ClassSession).filter(ClassSession.id == session_id))
            session_obj = session_result.scalars().first()
        
        # Process records
        values = []
        for record in records:
            data = {
                'student_id': record.student_id,
                'status': record.status,
                'remarks': record.remarks,
            }
            
            if is_date_based:
                # Date-based attendance
                data['session_id'] = None
                data['batch_id'] = batch_id
                data['date'] = date
                data['course_id'] = None  # Could be fetched from batch if needed
            else:
                # Session-based attendance
                data['session_id'] = session_id
                if session_obj:
                    data['batch_id'] = session_obj.batch_id
                    data['course_id'] = session_obj.course_id
                    
            values.append(data)

        if not values:
            return []

        # PostgreSQL upsert (ON CONFLICT)
        stmt = insert(Attendance).values(values)
        
        if is_date_based:
            # Use batch_id + date + student_id constraint for date-based
            stmt = stmt.on_conflict_do_update(
                constraint='uq_attendance_batch_date_student',
                set_={
                    'status': stmt.excluded.status,
                    'remarks': stmt.excluded.remarks,
                }
            )
        else:
            # Use session_id + student_id constraint for session-based
            stmt = stmt.on_conflict_do_update(
                constraint='uq_attendance_session_student',
                set_={
                    'status': stmt.excluded.status,
                    'remarks': stmt.excluded.remarks,
                    'batch_id': stmt.excluded.batch_id,
                    'course_id': stmt.excluded.course_id,
                }
            )
        
        await db.execute(stmt)
        await db.commit()
        
        # Return updated list
        if is_date_based:
            return await self.get_by_batch_date(db, batch_id=batch_id, date=date)
        else:
            return await self.get_by_session(db, session_id=session_id)
    
    async def get_by_batch_date(self, db: AsyncSession, *, batch_id: int, date) -> List[Attendance]:
        """Get attendance records for a batch on a specific date."""
        result = await db.execute(
            select(Attendance)
            .options(selectinload(Attendance.student))
            .filter(Attendance.batch_id == batch_id, Attendance.date == date)
        )
        return result.scalars().all()

    async def get(self, db: AsyncSession, id: int) -> Optional[Attendance]:
        result = await db.execute(select(Attendance).filter(Attendance.id == id))
        return result.scalars().first()

    # Standard create/update/delete not strictly used yet but good to have placeholders or minimal impl if needed
    # using upsert_bulk for main logic.

attendance = CRUDAttendance()
