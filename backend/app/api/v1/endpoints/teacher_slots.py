from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from datetime import date

from app.api import deps
from app.schemas import teacher_slots as schemas
from app.crud.crud_teacher_slots import teacher_slot
from app.models.user import User, UserRole

router = APIRouter()

@router.post("/", response_model=schemas.TeacherSlot)
async def create_slot(
    *,
    db: AsyncSession = Depends(deps.get_db),
    slot_in: schemas.TeacherSlotCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create a new teacher time slot.
    """
    if str(current_user.id) != str(slot_in.teacher_id) and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized to create slots for other users")
        
    slot = await teacher_slot.create(db=db, obj_in=slot_in)
    return slot

@router.post("/bulk", response_model=List[schemas.TeacherSlot])
async def create_bulk_slots(
    *,
    db: AsyncSession = Depends(deps.get_db),
    slot_in: schemas.BulkSlotCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create multiple 1-hour time slots automatically.
    Example: start_time=08:00, end_time=12:00 creates:
    08:00-09:00, 09:00-10:00, 10:00-11:00, 11:00-12:00
    """
    if str(current_user.id) != str(slot_in.teacher_id) and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized to create slots for other users")
        
    slots = await teacher_slot.bulk_create(db=db, obj_in=slot_in)
    return slots

@router.get("/", response_model=List[schemas.TeacherSlot])
async def read_slots(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    teacher_id: UUID = Query(..., description="Filter by teacher ID"),
    # current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve teacher time slots.
    """
    slots = await teacher_slot.get_by_teacher(db, teacher_id=teacher_id, skip=skip, limit=limit)
    return slots

@router.put("/{id}", response_model=schemas.TeacherSlot)
async def update_slot(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    slot_in: schemas.TeacherSlotUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update a teacher time slot.
    """
    slot = await teacher_slot.get(db=db, id=id)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
        
    # Permission check: Teacher can update their own slots, Students can 'book' (update booked_by/status)
    if str(current_user.id) != str(slot.teacher_id) and current_user.role != UserRole.admin:
         # Check if it's a booking attempt
         if slot_in.status == "booked" and slot_in.booked_by == current_user.id:
             # Allow student to book
             pass
         else:
             # TODO: More granular permissions
             pass
             
    slot = await teacher_slot.update(db=db, db_obj=slot, obj_in=slot_in)
    return slot

@router.delete("/{id}", response_model=schemas.TeacherSlot)
async def delete_slot(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete a teacher time slot.
    """
    slot = await teacher_slot.get(db=db, id=id)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
        
    if str(current_user.id) != str(slot.teacher_id) and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this slot")
        
    slot = await teacher_slot.delete(db=db, id=id)
    return slot
