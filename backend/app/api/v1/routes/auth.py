"""Auth routes — register, login, refresh, verify email, password reset."""
from __future__ import annotations
from fastapi import APIRouter, Depends, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, RefreshRequest, PasswordResetRequest, PasswordResetConfirm, EmailVerificationRequest, MessageResponse
from app.services.auth_service import AuthService
from app.core.rate_limit import limiter

router = APIRouter()

@router.post("/register", response_model=MessageResponse, status_code=201)
@limiter.limit("5/minute")
async def register(request: Request, data: RegisterRequest, db: AsyncSession = Depends(get_db)) -> MessageResponse:
    """Register a new user account. Email verification required."""
    svc = AuthService(db)
    result = await svc.register(email=data.email, password=data.password, full_name=data.full_name)
    return MessageResponse(message="Registration successful. Please verify your email.")

@router.post("/login", response_model=TokenResponse, status_code=200)
@limiter.limit("5/minute")
async def login(request: Request, data: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    """Authenticate and receive access + refresh tokens."""
    svc = AuthService(db)
    tokens = await svc.login(email=data.email, password=data.password)
    # Set refresh token as httpOnly cookie
    response.set_cookie(key="refresh_token", value=tokens["refresh_token"], httponly=True, secure=True, samesite="strict", max_age=7 * 24 * 3600)
    return TokenResponse(access_token=tokens["access_token"], expires_in=tokens["expires_in"])

@router.post("/refresh", response_model=TokenResponse, status_code=200)
async def refresh(data: RefreshRequest, response: Response, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    """Exchange a refresh token for a new token pair."""
    svc = AuthService(db)
    tokens = await svc.refresh_token(data.refresh_token)
    response.set_cookie(key="refresh_token", value=tokens["refresh_token"], httponly=True, secure=True, samesite="strict", max_age=7 * 24 * 3600)
    return TokenResponse(access_token=tokens["access_token"], expires_in=tokens["expires_in"])

@router.post("/verify-email", response_model=MessageResponse, status_code=200)
async def verify_email(data: EmailVerificationRequest, db: AsyncSession = Depends(get_db)) -> MessageResponse:
    """Verify email address using the token sent during registration."""
    svc = AuthService(db)
    await svc.verify_email(data.token)
    return MessageResponse(message="Email verified successfully.")

@router.post("/forgot-password", response_model=MessageResponse, status_code=200)
async def forgot_password(data: PasswordResetRequest, db: AsyncSession = Depends(get_db)) -> MessageResponse:
    """Request a password reset email."""
    svc = AuthService(db)
    await svc.request_password_reset(data.email)
    # Always return 200 to prevent email enumeration
    return MessageResponse(message="If an account exists, a reset link has been sent.")

@router.post("/reset-password", response_model=MessageResponse, status_code=200)
async def reset_password(data: PasswordResetConfirm, db: AsyncSession = Depends(get_db)) -> MessageResponse:
    """Reset password using the reset token."""
    svc = AuthService(db)
    await svc.reset_password(data.token, data.new_password)
    return MessageResponse(message="Password reset successfully.")

@router.post("/logout", response_model=MessageResponse, status_code=200)
async def logout(response: Response) -> MessageResponse:
    """Clear the refresh token cookie."""
    response.delete_cookie(key="refresh_token")
    return MessageResponse(message="Logged out.")
