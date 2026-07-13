"""Auth service — registration, login, token management, password reset, email verification."""
from __future__ import annotations
from datetime import datetime, timezone
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import ConflictError, UnauthorizedError, NotFoundError, ValidationError
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token, create_email_verification_token, create_password_reset_token
from app.core.config import get_settings
from sqlalchemy.orm import selectinload
from app.models.user import User
from app.models.role import Role, UserRole
from app.repositories.user_repository import UserRepository

class AuthService:
    """Handles all authentication and authorization business logic."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.user_repo = UserRepository(db)

    async def register(self, email: str, password: str, full_name: str) -> dict:
        """
        Register a new user with email/password.

        Args:
            email: User's email address.
            password: Plaintext password (will be hashed).
            full_name: User's display name.

        Returns:
            Dict with user_id and verification token.

        Raises:
            ConflictError: If the email is already registered.
        """
        existing = await self.user_repo.get_by_email(email)
        if existing is not None:
            raise ConflictError(message="An account with this email already exists.")

        hashed = hash_password(password)
        user = await self.user_repo.create(email=email, hashed_password=hashed, full_name=full_name)

        # Assign default 'student' role
        role_stmt = select(Role).where(Role.name == "student")
        role = (await self.db.execute(role_stmt)).scalar_one_or_none()
        if role:
            user_role = UserRole(user_id=user.id, role_id=role.id)
            self.db.add(user_role)

        await self.db.commit()

        verification_token = create_email_verification_token(str(user.id))
        
        # Trigger welcome/verification email background task
        from app.workers.tasks.email_tasks import send_email_task
        verification_url = f"{get_settings().ALLOWED_ORIGINS}/verify-email?token={verification_token}"
        send_email_task.delay(
            to_email=user.email,
            subject="Verify Your Email — Academy",
            body_html=f"<h3>Welcome to Academy!</h3><p>Please click the link below to verify your email address:</p><p><a href='{verification_url}'>Verify Email</a></p>"
        )

        return {"user_id": str(user.id), "verification_token": verification_token}

    async def oauth_login_or_register(
        self,
        provider: str,
        provider_id: str,
        email: str,
        full_name: str,
        avatar_url: str | None = None
    ) -> dict:
        """Authenticate or register a user using an OAuth provider."""
        # 1. Try to find user by provider + provider_id
        stmt = select(User).where(
            User.oauth_provider == provider,
            User.oauth_provider_id == provider_id,
            User.deleted_at.is_(None)
        ).options(selectinload(User.user_roles).selectinload(UserRole.role))
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()

        # 2. If not found by OAuth, try by email
        if user is None:
            user = await self.user_repo.get_by_email(email)
            if user is not None:
                # Link existing user account to this OAuth provider
                user.oauth_provider = provider
                user.oauth_provider_id = provider_id
                if avatar_url and not user.avatar_url:
                    user.avatar_url = avatar_url
                await self.db.flush()

        # 3. If still not found, create new user
        if user is None:
            user = await self.user_repo.create(
                email=email,
                full_name=full_name,
                avatar_url=avatar_url,
                is_verified=True,  # OAuth emails are verified
                oauth_provider=provider,
                oauth_provider_id=provider_id,
                hashed_password=None  # No local password
            )
            # Assign default student role
            role_stmt = select(Role).where(Role.name == "student")
            role = (await self.db.execute(role_stmt)).scalar_one_or_none()
            if role:
                user_role = UserRole(user_id=user.id, role_id=role.id)
                self.db.add(user_role)
            await self.db.flush()

        # 4. Commit transaction
        await self.db.commit()

        # Reload user with roles loaded
        user = await self.user_repo.get_by_id(user.id)

        # 5. Generate tokens
        roles = [ur.role.name for ur in user.user_roles]
        settings = get_settings()
        access_token = create_access_token(str(user.id), roles=roles)
        refresh_token = create_refresh_token(str(user.id))

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

    async def login(self, email: str, password: str) -> dict:
        """
        Authenticate user and return token pair.
        """
        from app.core.redis_cache import get_redis_client
        redis_client = get_redis_client()
        lockout_key = f"lockout:{email.lower()}"
        attempts_key = f"attempts:{email.lower()}"

        if redis_client:
            is_locked = await redis_client.get(lockout_key)
            if is_locked:
                raise UnauthorizedError(message="Account is temporarily locked due to too many failed attempts. Try again in 15 minutes.")

        user = await self.user_repo.get_by_email(email)
        if user is None or user.hashed_password is None:
            raise UnauthorizedError(message="Invalid email or password.")

        if not verify_password(password, user.hashed_password):
            if redis_client:
                attempts = await redis_client.incr(attempts_key)
                if attempts == 1:
                    await redis_client.expire(attempts_key, 900)  # 15 minutes window
                if attempts >= 5:
                    await redis_client.set(lockout_key, "locked", ex=900)  # Lock for 15 minutes
                    await redis_client.delete(attempts_key)
                    raise UnauthorizedError(message="Too many failed attempts. Your account has been locked for 15 minutes.")
            raise UnauthorizedError(message="Invalid email or password.")

        if not user.is_active:
            raise UnauthorizedError(message="Account is deactivated.")

        if redis_client:
            await redis_client.delete(attempts_key)

        roles = [ur.role.name for ur in user.user_roles]
        settings = get_settings()
        access_token = create_access_token(str(user.id), roles=roles)
        refresh_token = create_refresh_token(str(user.id))

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

    async def refresh_token(self, refresh_token_str: str) -> dict:
        """
        Validate a refresh token and issue a new access/refresh pair.

        Raises:
            UnauthorizedError: If the refresh token is invalid or expired.
        """
        payload = decode_token(refresh_token_str)
        if payload.get("type") != "refresh":
            raise UnauthorizedError(message="Invalid token type.")

        user_id = payload.get("sub")
        user = await self.user_repo.get_by_id(UUID(user_id))
        if user is None or not user.is_active:
            raise UnauthorizedError(message="User not found or inactive.")

        roles = [ur.role.name for ur in user.user_roles]
        settings = get_settings()
        new_access = create_access_token(str(user.id), roles=roles)
        new_refresh = create_refresh_token(str(user.id))

        return {
            "access_token": new_access,
            "refresh_token": new_refresh,
            "token_type": "bearer",
            "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

    async def verify_email(self, token: str) -> None:
        """
        Verify a user's email address using the verification token.

        Raises:
            ValidationError: If the token is invalid or user not found.
        """
        payload = decode_token(token)
        if payload.get("type") != "email_verification":
            raise ValidationError(message="Invalid verification token.")

        user = await self.user_repo.get_by_id(UUID(payload["sub"]))
        if user is None:
            raise NotFoundError(resource="User")

        await self.user_repo.update(user, is_verified=True)
        await self.db.commit()

    async def request_password_reset(self, email: str) -> str | None:
        """
        Generate a password reset token if the email exists.

        Returns the token (to be sent via email), or None if user not found
        (to prevent email enumeration, callers should still return 200).
        """
        user = await self.user_repo.get_by_email(email)
        if user is None:
            return None
        
        token = create_password_reset_token(str(user.id))
        
        # Trigger reset email background task
        from app.workers.tasks.email_tasks import send_email_task
        reset_url = f"{get_settings().ALLOWED_ORIGINS}/reset-password?token={token}"
        send_email_task.delay(
            to_email=user.email,
            subject="Reset Your Password — Academy",
            body_html=f"<h3>Password Reset Request</h3><p>Please click the link below to reset your password:</p><p><a href='{reset_url}'>Reset Password</a></p>"
        )

        return token

    async def reset_password(self, token: str, new_password: str) -> None:
        """
        Reset a user's password using a valid reset token.

        Raises:
            ValidationError: If the token is invalid.
            NotFoundError: If the user is not found.
        """
        payload = decode_token(token)
        if payload.get("type") != "password_reset":
            raise ValidationError(message="Invalid reset token.")

        user = await self.user_repo.get_by_id(UUID(payload["sub"]))
        if user is None:
            raise NotFoundError(resource="User")

        hashed = hash_password(new_password)
        await self.user_repo.update(user, hashed_password=hashed)
        await self.db.commit()
