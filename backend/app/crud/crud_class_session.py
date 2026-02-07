from typing import List, Optional, Union, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from uuid import UUID
from datetime import datetime

from app.models.class_session import ClassSession
from app.models.course import Course
from app.schemas.class_session import ClassSessionCreate, ClassSessionUpdate

class CRUDClassSession:
    async def get(self, db: AsyncSession, id: int) -> Optional[ClassSession]:
        result = await db.execute(
            select(ClassSession)
            .options(
                selectinload(ClassSession.course).options(
                    selectinload(Course.badge),
                    selectinload(Course.provider)
                )
            )
            .filter(ClassSession.id == id)
        )
        return result.scalars().first()

    async def get_by_batch(self, db: AsyncSession, batch_id: int, skip: int = 0, limit: int = 100) -> List[ClassSession]:
        result = await db.execute(
            select(ClassSession)
            .options(
                selectinload(ClassSession.course).options(
                    selectinload(Course.badge),
                    selectinload(Course.provider)
                )
            )
            .filter(ClassSession.batch_id == batch_id)
            .order_by(ClassSession.start_time)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def get_by_teacher(self, db: AsyncSession, teacher_id: UUID, skip: int = 0, limit: int = 100) -> List[ClassSession]:
        result = await db.execute(
            select(ClassSession)
            .options(
                selectinload(ClassSession.course).options(
                    selectinload(Course.badge),
                    selectinload(Course.provider)
                )
            )
            .filter(ClassSession.teacher_id == teacher_id)
            .order_by(ClassSession.start_time)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def create(self, db: AsyncSession, *, obj_in: ClassSessionCreate) -> ClassSession:
        db_obj = ClassSession(
            batch_id=obj_in.batch_id,
            course_id=obj_in.course_id,
            teacher_id=obj_in.teacher_id,
            start_time=obj_in.start_time,
            end_time=obj_in.end_time,
            meeting_link=obj_in.meeting_link,
            is_recorded=obj_in.is_recorded
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        
        # Reload with relationships to avoid MissingGreenlet error on response serialization
        return await self.get(db, id=db_obj.id)

    async def update(self, db: AsyncSession, *, db_obj: ClassSession, obj_in: Union[ClassSessionUpdate, Dict[str, Any]]) -> ClassSession:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)

        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])

        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        
        # Reload with relationships to avoid MissingGreenlet error on response serialization
        return await self.get(db, id=db_obj.id)

    async def delete(self, db: AsyncSession, *, id: int) -> Optional[ClassSession]:
        result = await db.execute(select(ClassSession).filter(ClassSession.id == id))
        obj = result.scalars().first()
        if obj:
            await db.delete(obj)
            await db.commit()
        return obj

class_session = CRUDClassSession()
