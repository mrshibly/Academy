"""
FastAPI application entrypoint.

Creates the app, registers middleware, exception handlers, and routers.
Provides /healthz and /readyz endpoints for orchestration checks.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan: runs setup on startup, cleanup on shutdown."""
    setup_logging()
    yield
    # Shutdown tasks (close pools, etc.) can go here


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

    # ---- CORS ----
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

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
    async def readyz() -> JSONResponse:
        """Readiness probe — the app can serve traffic."""
        # Future: check DB / Redis connectivity
        return JSONResponse(content={"status": "ready"})

    return application


app = create_app()
