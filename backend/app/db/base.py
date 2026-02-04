from typing import Any
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

# Import all models here so Alembic can find them
# MOVED TO alembic/env.py TO FIX CIRCULAR IMPORT
# from app.models.user import User
# from app.models.role import Role
# from app.models.permission import Permission
# from app.models.chat import Chat, ChatMember, Message  # noqa
# from app.models.teacher_slots import TeacherSlot  # noqa
# from app.models.attendance import Attendance  # noqa
