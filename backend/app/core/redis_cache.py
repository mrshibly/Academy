"""
Async Redis caching utilities.

Provides get/set/invalidate helpers backed by redis.asyncio for
high-throughput, non-blocking cache operations. Initialise once
at application startup via ``init_cache`` and tear down with
``close_cache``.
"""

from __future__ import annotations

import json
from typing import Any

import redis.asyncio as aioredis

from app.core.config import get_settings

# Module-level reference — set by ``init_cache`` during app startup.
_redis: aioredis.Redis | None = None


async def init_cache() -> None:
    """Create and store the async Redis connection pool."""
    global _redis
    settings = get_settings()
    _redis = aioredis.from_url(
        settings.REDIS_URL,
        decode_responses=True,
        max_connections=20,
    )


async def close_cache() -> None:
    """Gracefully close the Redis connection pool."""
    global _redis
    if _redis is not None:
        await _redis.aclose()
        _redis = None


def _get_client() -> aioredis.Redis:
    """Return the initialised Redis client or raise if uninitialised."""
    if _redis is None:
        raise RuntimeError(
            "Redis cache not initialised. Call init_cache() during app startup."
        )
    return _redis


async def cache_get(key: str) -> Any | None:
    """
    Retrieve a cached value by key.

    Returns:
        The deserialised Python object, or ``None`` on cache miss.
    """
    client = _get_client()
    raw = await client.get(key)
    if raw is None:
        return None
    return json.loads(raw)


async def cache_set(key: str, data: Any, ttl: int | None = None) -> None:
    """
    Store a value in the cache.

    Args:
        key: Cache key.
        data: Any JSON-serialisable Python object.
        ttl: Time-to-live in seconds. Falls back to the configured default.
    """
    client = _get_client()
    if ttl is None:
        ttl = get_settings().REDIS_CACHE_DEFAULT_TTL
    await client.set(key, json.dumps(data, default=str), ex=ttl)


async def cache_invalidate(pattern: str) -> int:
    """
    Delete all keys matching a glob *pattern*.

    Uses ``SCAN`` internally to avoid blocking the Redis server on large
    key-spaces (unlike ``KEYS``).

    Args:
        pattern: A Redis glob pattern, e.g. ``"cache:courses:*"``.

    Returns:
        Number of keys deleted.
    """
    client = _get_client()
    deleted = 0
    async for key in client.scan_iter(match=pattern, count=100):
        await client.delete(key)
        deleted += 1
    return deleted
