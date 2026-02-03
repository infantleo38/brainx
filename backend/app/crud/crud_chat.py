from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import desc, func, case, and_

from app.models.chat import Chat, ChatMember, Message, ChatMemberRoleEnum, MessageRead, ChatResource
from app.schemas.chat import ChatCreate, ChatUpdate, MessageCreate, ChatMemberCreate, ChatResourceCreate

class CRUDChat:
    async def get(self, db: AsyncSession, id: int) -> Optional[Chat]:
        result = await db.execute(
            select(Chat)
            .options(
                selectinload(Chat.members).selectinload(ChatMember.user),
                selectinload(Chat.batch)
            )
            .filter(Chat.id == id)
        )
        return result.scalars().first()

    async def get_by_user(self, db: AsyncSession, user_id: UUID, skip: int = 0, limit: int = 100) -> List[Chat]:
        # Join with ChatMember to find chats where user is a member
        result = await db.execute(
            select(Chat)
            .join(ChatMember)
            .options(
                selectinload(Chat.members).selectinload(ChatMember.user),
                selectinload(Chat.batch)
            )
            .filter(ChatMember.user_id == user_id)
            .order_by(desc(Chat.created_at))
            .offset(skip)
            .limit(limit)
        )
        return result.unique().scalars().all()

    async def create(self, db: AsyncSession, *, obj_in: ChatCreate, created_by: UUID) -> Chat:
        db_obj = Chat(
            chat_type=obj_in.chat_type,
            batch_id=obj_in.batch_id,
            is_official=obj_in.is_official,
            student_id=obj_in.student_id,
            created_by=created_by
        )
        db.add(db_obj)
        await db.flush() # get ID

        # Add creator as admin member
        creator_member = ChatMember(
            chat_id=db_obj.id,
            user_id=created_by,
            role=ChatMemberRoleEnum.admin
        )
        db.add(creator_member)

        # Add initial members
        if obj_in.initial_members:
            for m_in in obj_in.initial_members:
                member = ChatMember(
                    chat_id=db_obj.id,
                    user_id=m_in.user_id,
                    role_id=m_in.role_id,
                    role=m_in.role
                )
                db.add(member)

        await db.commit()
        # Instead of refresh, we fetch the full object with relations to avoid MissingGreenlet
        return await self.get(db, db_obj.id)
    
    async def get_by_batch(self, db: AsyncSession, batch_id: int) -> Optional[Chat]:
        """Find chat for a specific batch"""
        result = await db.execute(
            select(Chat)
            .filter(Chat.batch_id == batch_id)
            .options(selectinload(Chat.members))
        )
        return result.scalars().first()
    
    async def add_member(self, db: AsyncSession, *, chat_id: int, member_in: ChatMemberCreate) -> ChatMember:
        """Add a member to an existing chat"""
        # Check if member already exists
        existing = await db.execute(
            select(ChatMember)
            .filter(ChatMember.chat_id == chat_id, ChatMember.user_id == member_in.user_id)
        )
        if existing.scalars().first():
            return existing.scalars().first()
        
        member = ChatMember(
            chat_id=chat_id,
            user_id=member_in.user_id,
            role_id=member_in.role_id,
            role=member_in.role
        )
        db.add(member)
        await db.commit()
        await db.refresh(member)
        return member

    async def create_resource(self, db: AsyncSession, *, obj_in: ChatResourceCreate, chat_id: int, sender_id: UUID) -> ChatResource:
        db_obj = ChatResource(
            chat_id=chat_id,
            sender_id=sender_id,
            file_url=obj_in.file_url,
            file_name=obj_in.file_name,
            file_type=obj_in.file_type
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

class CRUDMessage:
    async def create(self, db: AsyncSession, *, obj_in: MessageCreate, sender_id: UUID) -> Message:
        db_obj = Message(
            chat_id=obj_in.chat_id,
            batch_id=obj_in.batch_id,
            sender_id=sender_id,
            message=obj_in.message,
            is_system_message=obj_in.is_system_message
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_by_chat(self, db: AsyncSession, chat_id: int, skip: int = 0, limit: int = 50) -> List[Message]:
        # 1. Get raw messages
        result = await db.execute(
            select(Message)
            .filter(Message.chat_id == chat_id)
            .order_by(desc(Message.created_at))
            .offset(skip)
            .limit(limit)
        )
        messages = result.scalars().all()
        
        if not messages:
            return []

        # 2. Get total member count
        total_members_query = await db.execute(
            select(func.count(ChatMember.id)).filter(ChatMember.chat_id == chat_id)
        )
        total_members = total_members_query.scalar() or 0
        
        # 3. For each message, get read count
        message_ids = [m.id for m in messages]
        
        read_counts_query = await db.execute(
            select(MessageRead.message_id, func.count(MessageRead.id))
            .filter(MessageRead.message_id.in_(message_ids))
            .filter(MessageRead.status == 'read')
            .group_by(MessageRead.message_id)
        )
        read_counts = dict(read_counts_query.all()) # {msg_id: count}

        # 4. Compute status
        for msg in messages:
            read_count = read_counts.get(msg.id, 0)
            
            # Logic: If read_count == (total_members - 1), then 'read' (Blue Tick)
            if total_members > 1 and read_count >= (total_members - 1):
                msg.status = 'read' # Blue Tick
            elif read_count > 0:
                msg.status = 'delivered' # Double tick
            else:
                 msg.status = 'sent' # Single tick
                 
            msg.read_count = read_count
            
        return messages

class CRUDMessageRead:
    async def mark_read(self, db: AsyncSession, message_id: int, user_id: UUID, chat_id: int) -> Optional[MessageRead]:
        # Check if already read
        result = await db.execute(
            select(MessageRead)
            .filter(
                MessageRead.message_id == message_id,
                MessageRead.user_id == user_id
            )
        )
        existing = result.scalars().first()
        if existing:
            return existing
            
        db_obj = MessageRead(
            message_id=message_id,
            user_id=user_id,
            chat_id=chat_id,
            status='read'
        )
        db.add(db_obj)
        try:
            await db.commit()
            await db.refresh(db_obj)
        except Exception:
            await db.rollback()
            # If constraint failed, it means race condition, so it exists
            return await self.get(db, message_id, user_id)
        return db_obj

    async def get(self, db: AsyncSession, message_id: int, user_id: UUID) -> Optional[MessageRead]:
        result = await db.execute(
             select(MessageRead)
            .filter(
                MessageRead.message_id == message_id,
                MessageRead.user_id == user_id
            )
        )
        return result.scalars().first()

chat = CRUDChat()
message = CRUDMessage()
message_read = CRUDMessageRead()
