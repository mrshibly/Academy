"""
Security utilities: password hashing (argon2) and JWT token management.

Never import directly into routers — use the dependency layer instead.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings
from app.core.exceptions import UnauthorizedError

# ---------------------------------------------------------------------------
# Password hashing (argon2)
# ---------------------------------------------------------------------------

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(plain: str) -> str:
    """Hash a plaintext password using argon2."""
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plaintext password against its argon2 hash."""
    return pwd_context.verify(plain, hashed)


# ---------------------------------------------------------------------------
# JWT tokens
# ---------------------------------------------------------------------------

def create_access_token(
    subject: str,
    roles: list[str] | None = None,
    extra_claims: Dict[str, Any] | None = None,
) -> str:
    """
    Create a short-lived JWT access token.

    Args:
        subject: The user ID (UUID as string).
        roles: List of role names embedded in the token.
        extra_claims: Any additional claims to include.

    Returns:
        Encoded JWT string.
    """
    settings = get_settings()
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    payload: Dict[str, Any] = {
        "sub": subject,
        "iat": now,
        "exp": expire,
        "type": "access",
        "roles": roles or [],
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(subject: str) -> str:
    """
    Create a long-lived JWT refresh token.

    Args:
        subject: The user ID (UUID as string).

    Returns:
        Encoded JWT string.
    """
    settings = get_settings()
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    payload: Dict[str, Any] = {
        "sub": subject,
        "iat": now,
        "exp": expire,
        "type": "refresh",
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate a JWT token.

    Args:
        token: The raw JWT string.

    Returns:
        Decoded payload dict.

    Raises:
        UnauthorizedError: If the token is invalid or expired.
    """
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError as exc:
        raise UnauthorizedError(message="Invalid or expired token.") from exc
    return payload


def create_email_verification_token(user_id: str) -> str:
    """Create a token for email verification (24h TTL)."""
    settings = get_settings()
    now = datetime.now(timezone.utc)
    expire = now + timedelta(hours=24)
    payload = {"sub": user_id, "iat": now, "exp": expire, "type": "email_verification"}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_password_reset_token(user_id: str) -> str:
    """Create a token for password reset (1h TTL)."""
    settings = get_settings()
    now = datetime.now(timezone.utc)
    expire = now + timedelta(hours=1)
    payload = {"sub": user_id, "iat": now, "exp": expire, "type": "password_reset"}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
