"""
Application settings loaded from environment variables via pydantic-settings.

All secrets and environment-specific configuration must come from environment
variables — never hardcoded. See `.env.example` for the full list.
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration object for the application."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ---- General ----
    APP_NAME: str = "Academy Platform"
    ENVIRONMENT: str = "local"  # local | staging | production
    DEBUG: bool = False

    # ---- Database ----
    DATABASE_URL: str
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_RECYCLE: int = 3600
    DB_POOL_TIMEOUT: int = 30

    # ---- Redis ----
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CACHE_DEFAULT_TTL: int = 300  # seconds

    # ---- JWT ----
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ---- CORS ----
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse comma-separated origins into a list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    # ---- Stripe ----
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # ---- S3 / Object Storage ----
    S3_BUCKET_NAME: str = "academy-uploads"
    S3_REGION: str = "us-east-1"
    S3_ENDPOINT_URL: str | None = None  # Set for MinIO / local dev
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""

    # ---- Email (SMTP) ----
    SMTP_HOST: str = "localhost"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAILS_FROM_EMAIL: str = "noreply@academy.dev"
    EMAILS_FROM_NAME: str = "Academy Platform"

    # ---- OAuth ----
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance (parsed once per process)."""
    return Settings()  # type: ignore[call-arg]
