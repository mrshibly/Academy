"""
Domain-specific exception hierarchy and FastAPI global exception handlers.

Service-layer code raises these exceptions; the global handler translates
them into the standard API error envelope:
    {"error": {"code": "...", "message": "...", "details": {...}}}
"""

from __future__ import annotations

from typing import Any, Dict

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


# ---------------------------------------------------------------------------
# Base exception
# ---------------------------------------------------------------------------

class AppException(Exception):
    """Base class for all application-domain exceptions."""

    def __init__(
        self,
        code: str = "APP_ERROR",
        message: str = "An unexpected error occurred.",
        status_code: int = 500,
        details: Dict[str, Any] | None = None,
    ) -> None:
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


# ---------------------------------------------------------------------------
# Concrete exceptions
# ---------------------------------------------------------------------------

class NotFoundError(AppException):
    """Requested resource does not exist."""

    def __init__(self, resource: str = "Resource", details: Dict[str, Any] | None = None) -> None:
        super().__init__(
            code="NOT_FOUND",
            message=f"{resource} not found.",
            status_code=404,
            details=details,
        )


class ConflictError(AppException):
    """Operation conflicts with current state (e.g. duplicate)."""

    def __init__(self, message: str = "Resource already exists.", details: Dict[str, Any] | None = None) -> None:
        super().__init__(code="CONFLICT", message=message, status_code=409, details=details)


class ForbiddenError(AppException):
    """Authenticated user lacks permission for this action."""

    def __init__(self, message: str = "You do not have permission to perform this action.") -> None:
        super().__init__(code="FORBIDDEN", message=message, status_code=403)


class UnauthorizedError(AppException):
    """Missing or invalid authentication credentials."""

    def __init__(self, message: str = "Could not validate credentials.") -> None:
        super().__init__(code="UNAUTHORIZED", message=message, status_code=401)


class ValidationError(AppException):
    """Business-rule validation failure (distinct from Pydantic parse errors)."""

    def __init__(self, message: str = "Validation error.", details: Dict[str, Any] | None = None) -> None:
        super().__init__(code="VALIDATION_ERROR", message=message, status_code=422, details=details)


class PaymentError(AppException):
    """Payment processing failure."""

    def __init__(self, message: str = "Payment processing failed.", details: Dict[str, Any] | None = None) -> None:
        super().__init__(code="PAYMENT_ERROR", message=message, status_code=402, details=details)


# ---------------------------------------------------------------------------
# Error response builder
# ---------------------------------------------------------------------------

def _error_response(status_code: int, code: str, message: str, details: Dict[str, Any] | None = None) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": code, "message": message, "details": details or {}}},
    )


# ---------------------------------------------------------------------------
# Register handlers on the app
# ---------------------------------------------------------------------------

def register_exception_handlers(app: FastAPI) -> None:
    """Attach global exception handlers to the FastAPI application."""

    @app.exception_handler(AppException)
    async def app_exception_handler(_request: Request, exc: AppException) -> JSONResponse:
        return _error_response(exc.status_code, exc.code, exc.message, exc.details)

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(_request: Request, exc: RequestValidationError) -> JSONResponse:
        return _error_response(
            status_code=422,
            code="VALIDATION_ERROR",
            message="Request validation failed.",
            details={"errors": exc.errors()},
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(_request: Request, exc: StarletteHTTPException) -> JSONResponse:
        return _error_response(
            status_code=exc.status_code,
            code="HTTP_ERROR",
            message=str(exc.detail),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(_request: Request, exc: Exception) -> JSONResponse:
        # Log the full traceback internally; return a safe message externally
        import structlog

        logger = structlog.get_logger()
        logger.exception("Unhandled exception", exc_info=exc)
        return _error_response(500, "INTERNAL_ERROR", "An internal server error occurred.")
