from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.api import deps
from app.schemas import parent_student as schemas
from app.schemas.user import UserResponse as UserSchema
from app.crud.crud_parent_student import parent_student
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=schemas.ParentStudent)
async def link_parent_student(
    *,
    db: AsyncSession = Depends(deps.get_db),
    link_in: schemas.ParentStudentCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Link a parent to a student.
    """
    # Only admin, coordinator, teacher, or the parent themselves can create a link
    # Ensure safe string comparison for role
    user_role = str(current_user.role.value if hasattr(current_user.role, 'value') else current_user.role)
    if user_role not in ["admin", "coordinator", "teacher"] and str(current_user.id) != str(link_in.parent_id):
        raise HTTPException(status_code=403, detail="Not authorized to create this relationship")

    # Check if link already exists (simple check, or rely on DB constraint if added)
    # For now, just create
    link = await parent_student.create(db=db, obj_in=link_in)
    return link

@router.get("/students/{parent_id}", response_model=List[UserSchema])
async def get_students(
    parent_id: UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get all students linked to a parent.
    """
    user_role = str(current_user.role.value if hasattr(current_user.role, 'value') else current_user.role)
    if user_role not in ["admin", "coordinator", "teacher"] and str(current_user.id) != str(parent_id):
        raise HTTPException(status_code=403, detail="Not authorized to view these students")
        
    students = await parent_student.get_students_by_parent(db=db, parent_id=parent_id)
    return students

@router.get("/parents/{student_id}", response_model=List[UserSchema])
async def get_parents(
    student_id: UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get all parents linked to a student.
    """
    # Student can view their parents, or admin/teacher/coordinator
    user_role = str(current_user.role.value if hasattr(current_user.role, 'value') else current_user.role)
    if user_role not in ["admin", "coordinator", "teacher"] and str(current_user.id) != str(student_id):
        raise HTTPException(status_code=403, detail="Not authorized to view these parents")

    parents = await parent_student.get_parents_by_student(db=db, student_id=student_id)
    return parents

@router.delete("/", response_model=schemas.ParentStudent)
async def unlink_parent_student(
    *,
    db: AsyncSession = Depends(deps.get_db),
    parent_id: UUID,
    student_id: UUID,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Unlink a parent and student.
    """
    user_role = str(current_user.role.value if hasattr(current_user.role, 'value') else current_user.role)
    if user_role not in ["admin", "coordinator", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this relationship")
        
    link = await parent_student.delete(db=db, parent_id=parent_id, student_id=student_id)
    if not link:
        raise HTTPException(status_code=404, detail="Relationship not found")
    return link
