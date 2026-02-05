from typing import List, Optional, Any, Union, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.user import User
from app.models.enrollment import Enrollment
from app.models.batch import BatchMember
from app.models.chat import ChatMember, Message, MessageRead, ChatResource, Chat
from app.models.attendance import Attendance
from app.models.teacher_course import TeacherCourse
from app.models.teacher_slots import TeacherTimeSlot
from app.models.parent_student import ParentStudent
from app.models.attendance import Attendance
from app.models.teacher_course import TeacherCourse
from app.models.teacher_slots import TeacherTimeSlot
from app.models.parent_student import ParentStudent
from app.models.assessment import AssessmentSubmission
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash
from sqlalchemy import delete, update

class CRUDUser:
    async def get_by_email(self, db: AsyncSession, *, email: str) -> Optional[User]:
        result = await db.execute(select(User).filter(User.email == email))
        return result.scalars().first()

    async def get(self, db: AsyncSession, id: Any) -> Optional[User]:
        result = await db.execute(select(User).filter(User.id == id))
        return result.scalars().first()

    async def create(self, db: AsyncSession, *, obj_in: UserCreate) -> User:
        db_obj = User(
            full_name=obj_in.full_name,
            email=obj_in.email,
            phone=obj_in.phone,
            password_hash=get_password_hash(obj_in.password),
            role=obj_in.role,
            status=obj_in.status
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_multi(self, db: AsyncSession, *, skip: int = 0, limit: int = 100) -> List[User]:
        result = await db.execute(select(User).offset(skip).limit(limit))
        return result.scalars().all()

    async def search(self, db: AsyncSession, *, query: str, skip: int = 0, limit: int = 100) -> List[User]:
        from sqlalchemy import or_
        term = f"%{query}%"
        result = await db.execute(
            select(User)
            .filter(
                or_(
                    User.full_name.ilike(term),
                    User.email.ilike(term),
                    User.phone.ilike(term)
                )
            )
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def update(self, db: AsyncSession, *, db_obj: User, obj_in: Union[UserUpdate, Dict[str, Any]]) -> User:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)

        if "password" in update_data and update_data["password"]:
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["password_hash"] = hashed_password

        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])

        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def remove(self, db: AsyncSession, *, id: Any) -> User:
        result = await db.execute(select(User).filter(User.id == id))
        obj = result.scalars().first()
        if not obj:
            return None

        # Manually delete related records to avoid FK constraints
        # 1. Enrollments
        await db.execute(delete(Enrollment).where(Enrollment.student_id == id))
        await db.execute(delete(Enrollment).where(Enrollment.teacher_id == id))

        # 2. Batch Members
        await db.execute(delete(BatchMember).where(BatchMember.user_id == id))

        # 3. Chat Members
        await db.execute(delete(ChatMember).where(ChatMember.user_id == id))

        # 4. Messages (Sender) - This cascades to MessageReads usually, but better to be safe
        # Note: If we delete messages, we lose history. Ideally we'd validly anonymize, but for now delete.
        await db.execute(delete(Message).where(Message.sender_id == id))
        
        # 5. Message Reads
        await db.execute(delete(MessageRead).where(MessageRead.user_id == id))

        # 6. Chat Resources
        await db.execute(delete(ChatResource).where(ChatResource.sender_id == id))

        # 7. Attendance
        await db.execute(delete(Attendance).where(Attendance.student_id == id))

        # 8. Teacher Courses
        await db.execute(delete(TeacherCourse).where(TeacherCourse.teacher_id == id))

        # 9. Teacher Slots
        await db.execute(delete(TeacherTimeSlot).where(TeacherTimeSlot.teacher_id == id))

        # 10. Parent-Student Links
        await db.execute(delete(ParentStudent).where(ParentStudent.parent_id == id))
        await db.execute(delete(ParentStudent).where(ParentStudent.student_id == id))

        # 11. Assessment Submissions
        await db.execute(delete(AssessmentSubmission).where(AssessmentSubmission.student_id == id))
        
        # 12. Handle Chats created by user (update to null/system or delete if orphaned?)
        # Reassign chats to another admin if possible to preserve history (e.g. batch chats)
        # Find another admin
        result_admin = await db.execute(
            select(User).filter(User.role == 'admin', User.id != id).limit(1)
        )
        substitute_admin = result_admin.scalars().first()
        
        if substitute_admin:
            # Reassign chats to this admin
            await db.execute(
                update(Chat)
                .where(Chat.created_by == id)
                .values(created_by=substitute_admin.id)
            )
        else:
            # No substitute found (rare/dangerous), we must delete the chats to proceed
            await db.execute(delete(Chat).where(Chat.created_by == id))

        await db.delete(obj)
        await db.commit()
        return obj

user = CRUDUser()
