"""Google OAuth authentication routes."""
from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app.db.session import get_db
from app.core.config import get_settings
from app.services.auth_service import AuthService
from app.schemas.auth import TokenResponse

router = APIRouter()

class GoogleLoginRequest(BaseModel):
    id_token: str

@router.post("/google", response_model=TokenResponse, status_code=200)
async def google_login(
    data: GoogleLoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
) -> TokenResponse:
    """Verify Google ID token and return access + refresh tokens."""
    settings = get_settings()
    try:
        # Verify the ID token using google-auth library
        import asyncio
        client_id = settings.GOOGLE_CLIENT_ID or None
        idinfo = await asyncio.to_thread(
            id_token.verify_oauth2_token,
            data.id_token,
            google_requests.Request(),
            client_id,
            clock_skew_in_seconds=20
        )

        # ID token is valid, extract user info
        email = idinfo.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by Google.")
        
        full_name = idinfo.get("name", email.split("@")[0])
        provider_id = idinfo.get("sub")
        avatar_url = idinfo.get("picture")

        # Authenticate or register the user
        svc = AuthService(db)
        tokens = await svc.oauth_login_or_register(
            provider="google",
            provider_id=provider_id,
            email=email,
            full_name=full_name,
            avatar_url=avatar_url
        )

        # Set refresh token as httpOnly cookie
        response.set_cookie(
            key="refresh_token",
            value=tokens["refresh_token"],
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=7 * 24 * 3600
        )

        return TokenResponse(
            access_token=tokens["access_token"],
            expires_in=tokens["expires_in"]
        )

    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google ID token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")
