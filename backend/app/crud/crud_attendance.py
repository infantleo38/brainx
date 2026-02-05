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

    async def upsert_bulk(self, db: AsyncSession, *, session_id: int, records: List[AttendanceCreate]) -> List[Attendance]:
        # Fetch session details to get batch_id and course_id
        session_result = await db.execute(select(ClassSession).filter(ClassSession.id == session_id))
        session_obj = session_result.scalars().first()
        
        # Process in batches if list is huge, but here standard size is fine
        values = []
        for record in records:
            data = record.dict()
            if session_obj:
                data['batch_id'] = session_obj.batch_id
                data['course_id'] = session_obj.course_id
            values.append(data)

        if not values:
            return []

        # PostgreSQL upsert (ON CONFLICT)
        stmt = insert(Attendance).values(values)
        stmt = stmt.on_conflict_do_update(
            constraint='uq_attendance_session_student',
            set_={
                'status': stmt.excluded.status,
                'remarks': stmt.excluded.remarks,
                'batch_id': stmt.excluded.batch_id,
                'course_id': stmt.excluded.course_id,
                # 'created_at': stmt.excluded.created_at # Keep original created_at
            }
        )
        
        await db.execute(stmt)
        await db.commit()
        
        # Return updated list
        return await self.get_by_session(db, session_id=session_id)

    async def get(self, db: AsyncSession, id: int) -> Optional[Attendance]:
        result = await db.execute(select(Attendance).filter(Attendance.id == id))
        return result.scalars().first()

    # Standard create/update/delete not strictly used yet but good to have placeholders or minimal impl if needed
    # using upsert_bulk for main logic.

attendance = CRUDAttendance()
