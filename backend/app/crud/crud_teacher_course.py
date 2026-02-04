from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from app.models.teacher_course import TeacherCourse
from app.schemas.teacher_course import TeacherCourseCreate

class CRUDTeacherCourse:
    async def get(self, db: AsyncSession, id: int) -> Optional[TeacherCourse]:
        result = await db.execute(
            select(TeacherCourse)
            .options(joinedload(TeacherCourse.teacher))
            .filter(TeacherCourse.id == id)
        )
        return result.scalars().first()

    async def get_by_teacher_and_course(self, db: AsyncSession, *, teacher_id: UUID, course_id: int) -> Optional[TeacherCourse]:
        result = await db.execute(
            select(TeacherCourse)
            .options(joinedload(TeacherCourse.teacher))
            .filter(TeacherCourse.teacher_id == teacher_id, TeacherCourse.course_id == course_id)
        )
        return result.scalars().first()

    async def create(self, db: AsyncSession, *, obj_in: TeacherCourseCreate) -> TeacherCourse:
        db_obj = TeacherCourse(
            teacher_id=obj_in.teacher_id,
            course_id=obj_in.course_id
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        # Fetch with relationships
        return await self.get(db, db_obj.id)

    async def remove(self, db: AsyncSession, *, id: int) -> TeacherCourse:
        result = await db.execute(select(TeacherCourse).filter(TeacherCourse.id == id))
        obj = result.scalars().first()
        await db.delete(obj)
        await db.commit()
        return obj

    async def get_by_teacher(self, db: AsyncSession, *, teacher_id: UUID, skip: int = 0, limit: int = 100) -> List[TeacherCourse]:
        result = await db.execute(
            select(TeacherCourse)
            .options(joinedload(TeacherCourse.teacher))
            .filter(TeacherCourse.teacher_id == teacher_id)
            .offset(skip).limit(limit)
        )
        return result.scalars().all()

    async def get_by_course(self, db: AsyncSession, *, course_id: int, skip: int = 0, limit: int = 100) -> List[TeacherCourse]:
        result = await db.execute(
            select(TeacherCourse)
            .options(joinedload(TeacherCourse.teacher))
            .filter(TeacherCourse.course_id == course_id)
            .offset(skip).limit(limit)
        )
        return result.scalars().all()

teacher_course = CRUDTeacherCourse()
