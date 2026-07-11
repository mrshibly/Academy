"""Rate limiting configuration via SlowAPI."""
from __future__ import annotations
import redis
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.config import get_settings

settings = get_settings()

storage_uri = "memory://"
if settings.ENVIRONMENT not in ("testing", "local"):
    storage_uri = settings.REDIS_URL
else:
    try:
        # Check connection to Redis, falling back to memory if unreachable
        client = redis.Redis.from_url(settings.REDIS_URL, socket_timeout=1.0)
        client.ping()
        storage_uri = settings.REDIS_URL
        print("INFO:  SlowAPI rate limiter connected to Redis.")
    except Exception:
        print("WARNING: SlowAPI rate limiter falling back to in-memory storage (Redis offline).")
        storage_uri = "memory://"

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=storage_uri
)
