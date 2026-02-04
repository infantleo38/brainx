from typing import List, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.schemas.response import APIResponse
from app.services.user_service import user_service

router = APIRouter()

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.crud.crud_user import user as crud_user

# get_db moved to deps.py

@router.post("/", response_model=APIResponse[UserResponse])
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    created_user = await user_service.create_new_user(db=db, user_in=user)
    return APIResponse(
        status_code=200,
        message="User created successfully",
        data=created_user
    )

@router.get("/", response_model=APIResponse[List[UserResponse]])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    users = await user_service.get_users(db, skip=skip, limit=limit)
    return APIResponse(
        status_code=200,
        message="Users retrieved successfully",
        data=users
    )

@router.get("/search", response_model=APIResponse[List[UserResponse]])
async def search_users(
    q: str,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Search users by name, email, or phone number.
    """
    users = await user_service.search_users(db, query=q, skip=skip, limit=limit)
    return APIResponse(
        status_code=200,
        message="Users found successfully",
        data=users
    )

from app.schemas.user import UserWithPermissions
from app.crud.crud_role import role as crud_role

@router.get("/me", response_model=APIResponse[UserWithPermissions])
async def read_user_me(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get current user with permissions.
    """
    # Try to find the role by name in the DB to get permissions
    # User.role is an enum with values like "admin", "student"
    role_name = current_user.role.value
    
    role_obj = await crud_role.get_by_name(db, name=role_name)
    if not role_obj:
        # Try capitalized version (e.g., "Admin")
        role_obj = await crud_role.get_by_name(db, name=role_name.capitalize())
        
    permissions = []
    if role_obj:
        permissions = role_obj.permissions
        
    # Create response object
    # Pydantic v2 uses model_validate for ORM objects
    user_response = UserWithPermissions.model_validate(current_user)
    user_response.permissions = permissions
    
    return APIResponse(
        status_code=200,
        message="Current user retrieved successfully",
        data=user_response
    )

@router.put("/me", response_model=APIResponse[UserResponse])
async def update_user_me(
    user_in: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update current user profile.
    """
    updated_user = await user_service.update_user(db, user=current_user, user_in=user_in)
    return APIResponse(
        status_code=200,
        message="User updated successfully",
        data=updated_user
    )

@router.put("/{user_id}", response_model=APIResponse[UserResponse])
async def update_user(
    *,
    db: AsyncSession = Depends(get_db),
    user_id: UUID,
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
):
    """
    Update a user.
    """
    user = await crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = await crud_user.update(db, db_obj=user, obj_in=user_in)
    return APIResponse(
        status_code=200,
        message="User updated successfully",
        data=updated_user
    )

@router.delete("/{user_id}", response_model=APIResponse[UserResponse])
async def delete_user(
    *,
    db: AsyncSession = Depends(get_db),
    user_id: UUID,
    current_user: User = Depends(get_current_user),
):
    """
    Soft delete a user (set status to disabled).
    """
    user = await crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Soft delete: update status to False
    updated_user = await crud_user.update(db, db_obj=user, obj_in={'status': False})
    
    return APIResponse(
        status_code=200,
        message="User deactivated successfully",
        data=updated_user
    )
