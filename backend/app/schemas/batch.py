from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel
from enum import Enum
from uuid import UUID

# Enums
class BatchMemberRoleEnum(str, Enum):
    student = "student"
    teacher = "teacher"
    coordinator = "coordinator"
    counselor = "counselor"
    support = "support"

class BatchMemberStatusEnum(str, Enum):
    active = "active"
    inactive = "inactive"

# Batch Schemas
class BatchBase(BaseModel):
    course_id: int
    batch_name: str
    teacher_id: Optional[UUID] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    total_hours: Optional[int] = 0
    consumed_hours: Optional[Decimal] = 0.0
    remaining_hours: Optional[Decimal] = 0.0
    schedule_time: Optional[str] = None
    status: Optional[bool] = True

class BatchMemberInput(BaseModel):
    user_id: UUID
    role_id: Optional[int] = None

class BatchCreate(BatchBase):
    members: Optional[List[BatchMemberInput]] = []

class BatchUpdate(BatchBase):
    course_id: Optional[int] = None
    batch_name: Optional[str] = None
    teacher_id: Optional[UUID] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    total_hours: Optional[int] = None
    schedule_time: Optional[str] = None
    status: Optional[bool] = None
    members: Optional[List[BatchMemberInput]] = None

class BatchInDBBase(BatchBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Batch(BatchInDBBase):
    pass

# Custom Response Schemas
class BatchMemberDetail(BaseModel):
    user_id: UUID
    user_name: str
    user_email: str
    role_id: Optional[int] = None

    class Config:
        from_attributes = True

    @staticmethod
    def from_orm_obj(member):
        return BatchMemberDetail(
            user_id=member.user_id,
            user_name=member.user.full_name if member.user else "Unknown",
            user_email=member.user.email if member.user else "Unknown",
            role_id=member.role_id
        )

class BatchDetail(Batch):
    teacher_name: Optional[str] = None
    course_name: Optional[str] = None
    members: List[BatchMemberDetail] = []

    @staticmethod
    def from_orm_to_schema(batch_obj):
        # Manually map if Pydantic v2 from_attributes doesn't handle nested flattening easily
        # or rely on getter_dict. For simplicity let's rely on standard init if we can,
        # otherwise we might need a root validator or similar.
        # Actually, simpler approach: use a validator or a property in the schema?
        # Pydantic doesn't support properties well for mapping.
        # Let's try to map it in the endpoint or CRUD for clarity, OR use a validator here.
        pass
        
    # We will map this in the endpoint return or use a custom validator


# Batch Member Schemas
class BatchMemberBase(BaseModel):
    batch_id: int
    user_id: UUID
    role_id: Optional[int] = None
    role: Optional[BatchMemberRoleEnum] = BatchMemberRoleEnum.student
    status: Optional[BatchMemberStatusEnum] = BatchMemberStatusEnum.active

class BatchMemberCreate(BatchMemberBase):
    pass

class BatchMemberUpdate(BaseModel):
    role_id: Optional[int] = None
    role: Optional[BatchMemberRoleEnum] = None
    status: Optional[BatchMemberStatusEnum] = None

class BatchMemberInDBBase(BatchMemberBase):
    id: int
    joined_at: datetime

    class Config:
        from_attributes = True

class BatchMember(BatchMemberInDBBase):
    pass
