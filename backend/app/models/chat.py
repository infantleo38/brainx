from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, DateTime, Enum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.base import Base

class ChatTypeEnum(str, enum.Enum):
    direct = "direct"
    group = "group"

class ChatMemberRoleEnum(str, enum.Enum):
    admin = "admin"
    student = "student"
    parent = "parent"
    teacher = "teacher"
    coordinator = "coordinator"
    counselor = "counselor"
    support = "support"

class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    chat_type = Column(Enum(ChatTypeEnum), nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=True) # Optional for direct chats? User schema said batch_id
    is_official = Column(Boolean, default=False)
    group_icon = Column(String, nullable=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    batch = relationship("Batch", backref="chats")
    creator = relationship("User", foreign_keys=[created_by])
    student = relationship("User", foreign_keys=[student_id])
    members = relationship("ChatMember", back_populates="chat", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="chat", cascade="all, delete-orphan")
    resources = relationship("ChatResource", back_populates="chat", cascade="all, delete-orphan")

class ChatMember(Base):
    __tablename__ = "chat_members"

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True) # Ref schema
    role = Column(Enum(ChatMemberRoleEnum), nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    chat = relationship("Chat", back_populates="members")
    user = relationship("User", foreign_keys=[user_id])
    role_obj = relationship("Role")

    @property
    def user_name(self):
        return self.user.full_name if self.user else None

    @property
    def user_email(self):
        return self.user.email if self.user else None

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id", ondelete="CASCADE"), nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=True) # Redundant if in chat, but in schema
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    is_system_message = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    chat = relationship("Chat", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])
    reads = relationship("MessageRead", back_populates="message", cascade="all, delete-orphan")

class MessageRead(Base):
    __tablename__ = "message_reads"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    chat_id = Column(Integer, ForeignKey("chats.id", ondelete="CASCADE"), nullable=False)
    read_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(Enum("delivered", "read", name="messagereadstatusenum"), default="read")

    message = relationship("Message", back_populates="reads")
    user = relationship("User", foreign_keys=[user_id])
    chat = relationship("Chat", foreign_keys=[chat_id])
    user = relationship("User", foreign_keys=[user_id])


class ChatResource(Base):
    __tablename__ = "chat_resources"

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    file_url = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    file_type = Column(String, nullable=True) # e.g. 'image/jpeg', 'application/pdf'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    chat = relationship("Chat", back_populates="resources")
    sender = relationship("User", foreign_keys=[sender_id])
