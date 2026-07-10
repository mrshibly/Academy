"""Order and payment schemas."""
from __future__ import annotations
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

class CheckoutItemRequest(BaseModel):
    item_type: str  # course | service
    item_id: UUID

class CheckoutRequest(BaseModel):
    items: list[CheckoutItemRequest]

class CheckoutResponse(BaseModel):
    checkout_url: str
    order_id: UUID

class OrderRead(BaseModel):
    id: UUID
    status: str
    total_amount: float
    currency: str
    created_at: datetime
    model_config = {"from_attributes": True}
