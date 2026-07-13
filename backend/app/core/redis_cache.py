"""
Async Redis caching utilities.

Provides get/set/invalidate helpers backed by redis.asyncio with
graceful fallbacks if the Redis server is offline.
"""

from __future__ import annotations

import json
from typing import Any

import redis.asyncio as aioredis

from app.core.config import get_settings

# Module-level reference — set by ``init_cache`` during app startup.
_redis: aioredis.Redis | None = None


def get_redis_client() -> aioredis.Redis | None:
    """Return the active Redis client reference."""
    return _redis


async def init_cache() -> None:
    """Create and store the async Redis connection pool, falling back gracefully if offline."""
    global _redis
    settings = get_settings()
    try:
        client = aioredis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            max_connections=20,
            socket_connect_timeout=2.0
        )
        # Verify connection
        await client.ping()
        _redis = client
        print("INFO:  Redis cache connected successfully.")
    except Exception as e:
        print(f"WARNING: Redis server is offline. Running without caching layer: {e}")
        _redis = None


async def close_cache() -> None:
    """Gracefully close the Redis connection pool."""
    global _redis
    if _redis is not None:
        try:
            await _redis.aclose()
        except Exception:
            pass
        _redis = None


async def cache_get(key: str) -> Any | None:
    """Retrieve a cached value by key. Returns None if cache is offline or miss."""
    if _redis is None:
        return None
    try:
        raw = await _redis.get(key)
        if raw is None:
            return None
        return json.loads(raw)
    except Exception:
        return None


async def cache_set(key: str, data: Any, ttl: int | None = None) -> None:
    """Store a value in the cache. Bypasses if cache is offline."""
    if _redis is None:
        return
    try:
        if ttl is None:
            ttl = get_settings().REDIS_CACHE_DEFAULT_TTL
        await _redis.set(key, json.dumps(data, default=str), ex=ttl)
    except Exception:
        pass


async def cache_invalidate(pattern: str) -> int:
    """Delete all keys matching a glob *pattern*. Bypasses if cache is offline."""
    if _redis is None:
        return 0
    try:
        deleted = 0
        async for key in _redis.scan_iter(match=pattern, count=100):
            await _redis.delete(key)
            deleted += 1
        return deleted
    except Exception:
        return 0
