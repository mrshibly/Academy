"""
FastAPI application entrypoint.

Creates the app, registers middleware, exception handlers, and routers.
Provides /healthz and /readyz endpoints for orchestration checks.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import setup_logging
from app.db.session import get_db


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan: runs setup on startup, cleanup on shutdown."""
    setup_logging()

    # Initialise Redis cache pool
    from app.core.redis_cache import init_cache, close_cache

    await init_cache()

    yield

    # Shutdown: close Redis pool
    await close_cache()


def create_app() -> FastAPI:
    """Application factory — builds and configures the FastAPI instance."""
    settings = get_settings()

    application = FastAPI(
        title=settings.APP_NAME,
        description="AI Development + Cybersecurity Academy & Services Platform API",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # ---- GZip compression (60-80% smaller JSON responses) ----
    application.add_middleware(GZipMiddleware, minimum_size=500)

    # ---- SlowAPI Rate Limiter ----
    from app.core.rate_limit import limiter
    from slowapi.errors import RateLimitExceeded
    from slowapi import _rate_limit_exceeded_handler
    application.state.limiter = limiter
    application.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # ---- CORS ----
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    )

    # ---- Security headers middleware ----
    @application.middleware("http")
    async def add_security_headers(request: Request, call_next) -> Response:  # type: ignore[no-untyped-def]
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        if settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains"
            )
            response.headers["Content-Security-Policy"] = "default-src 'self'"
        return response

    # ---- Exception handlers ----
    register_exception_handlers(application)

    # ---- Routers ----
    from app.api.v1.router import api_v1_router

    application.include_router(api_v1_router, prefix="/api/v1")

    # ---- Health checks ----
    @application.get("/healthz", tags=["Health"], status_code=200)
    async def healthz() -> JSONResponse:
        """Liveness probe — the process is running."""
        return JSONResponse(content={"status": "ok"})

    @application.get("/readyz", tags=["Health"], status_code=200)
    async def readyz(
        db = Depends(get_db)
    ) -> JSONResponse:
        """Readiness probe — the app can serve traffic."""
        from sqlalchemy import text
        from app.core.redis_cache import get_redis_client

        errors = []
        
        # 1. DB connectivity check
        try:
            await db.execute(text("SELECT 1"))
        except Exception as e:
            errors.append(f"database_error: {str(e)}")

        # 2. Redis connectivity check
        try:
            redis_client = get_redis_client()
            if redis_client:
                await redis_client.ping()
            else:
                errors.append("redis_error: Client not initialized.")
        except Exception as e:
            errors.append(f"redis_error: {str(e)}")

        if errors:
            return JSONResponse(
                status_code=503,
                content={"status": "unhealthy", "errors": errors}
            )

        return JSONResponse(content={"status": "ready"})

    return application


app = create_app()
