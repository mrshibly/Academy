"""Common schemas shared across domains — pagination, error envelope."""
from __future__ import annotations
from typing import Any, Generic, List, TypeVar
from pydantic import BaseModel

T = TypeVar("T")

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: dict[str, Any] = {}

class ErrorResponse(BaseModel):
    error: ErrorDetail

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int

class PaginationParams(BaseModel):
    page: int = 1
    page_size: int = 20
