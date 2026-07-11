"""Rate limiting configuration via SlowAPI."""
from __future__ import annotations
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.config import get_settings

settings = get_settings()
storage_uri = "memory://" if settings.ENVIRONMENT == "testing" else settings.REDIS_URL
# Limit requests per IP address, storing keys in Redis (or in-memory for testing)
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=storage_uri
)
