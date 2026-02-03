from typing import Optional, List, Union
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel
from app.models.chat import ChatTypeEnum, ChatMemberRoleEnum

# --- Message Schemas ---
class MessageBase(BaseModel):
    message: str
    is_system_message: Optional[bool] = False

class MessageCreate(MessageBase):
    chat_id: int
    batch_id: Optional[int] = None

class MessageInDBBase(MessageBase):
    id: int
    chat_id: int
    batch_id: Optional[int] = None
    sender_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class Message(MessageInDBBase):
    sender_name: Optional[str] = None # For UI convenience
    status: Optional[str] = "sent" # sent, delivered, read
    read_count: Optional[int] = 0

# --- Message Read Schemas ---
class MessageReadBase(BaseModel):
    message_id: int
    user_id: UUID
    chat_id: int
    status: str # delivered, read

class MessageReadCreate(MessageReadBase):
    pass

class MessageRead(MessageReadBase):
    id: int
    read_at: datetime

    class Config:
        from_attributes = True

# --- Chat Member Schemas ---
class ChatMemberBase(BaseModel):
    user_id: UUID
    role: ChatMemberRoleEnum
    role_id: Optional[int] = None

class ChatMemberCreate(ChatMemberBase):
    pass

class ChatMemberInDBBase(ChatMemberBase):
    id: int
    chat_id: int
    joined_at: datetime
    
    class Config:
        from_attributes = True

# --- User Schema for Chat ---
class UserSimple(BaseModel):
    id: UUID
    full_name: str
    email: str
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    
    class Config:
        from_attributes = True

class ChatMember(ChatMemberInDBBase):
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    user: Optional[UserSimple] = None

# --- Chat Schemas ---
class ChatBase(BaseModel):
    chat_type: ChatTypeEnum
    batch_id: Optional[int] = None
    is_official: Optional[bool] = False
    group_icon: Optional[str] = None
    student_id: Optional[UUID] = None

class ChatCreate(ChatBase):
    initial_members: Optional[List[ChatMemberCreate]] = []

# --- Chat Schemas ---
class ChatBase(BaseModel):
    chat_type: ChatTypeEnum
    batch_id: Optional[int] = None
    is_official: Optional[bool] = False
    group_icon: Optional[str] = None
    student_id: Optional[UUID] = None

class ChatCreate(ChatBase):
    initial_members: Optional[List[ChatMemberCreate]] = []

class ChatUpdate(BaseModel):
    is_official: Optional[bool] = None
    group_icon: Optional[str] = None

class ChatInDBBase(ChatBase):
    id: int
    created_by: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class BatchSimple(BaseModel):
    id: int
    batch_name: str
    
    class Config:
        from_attributes = True

class Chat(ChatInDBBase):
    members: List[ChatMember] = []
    latest_message: Optional[Message] = None
    batch: Optional[BatchSimple] = None

# --- Resource Schemas ---
class ChatResourceBase(BaseModel):
    file_url: str
    file_name: str
    file_type: Optional[str] = None

class ChatResourceCreate(ChatResourceBase):
    pass

class ChatResource(ChatResourceBase):
    id: int
    chat_id: int
    sender_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True
