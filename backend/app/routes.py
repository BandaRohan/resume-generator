from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from typing import Optional
import uuid

from app.models import UserCreate, UserLogin, UserResponse, TokenResponse
from app.database import Database
from app.auth import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user

# Create router
router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    """Register a new user"""
    # Check if user already exists
    existing_user = await Database.get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Create user
    user_id = await Database.create_user(user.name, user.email, user.password)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )
    
    # Generate token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user_id,
        "name": user.name,
        "email": user.email
    }

@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login a user"""
    user = await Database.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["id"]},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user["id"],
        "name": user["name"],
        "email": user["email"]
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    # Generate a new token for the user
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_user["id"], "is_guest": current_user.get("is_guest", False)},
        expires_delta=access_token_expires
    )
    
    return {
        "user_id": current_user["id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/guest", response_model=TokenResponse)
async def guest_login():
    """Create a guest session without registration"""
    # Generate a unique guest ID
    guest_id = str(uuid.uuid4())
    guest_name = "Guest User"
    guest_email = f"guest_{guest_id[:8]}@example.com"
    
    # Generate token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": guest_id, "is_guest": True},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": guest_id,
        "name": guest_name,
        "email": guest_email
    }
