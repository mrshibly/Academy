"""Payment routes — checkout and Stripe webhook."""
from __future__ import annotations
from fastapi import APIRouter, Depends, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.order import CheckoutRequest, CheckoutResponse
from app.services.payment_service import PaymentService

router = APIRouter()

@router.post("/checkout", response_model=CheckoutResponse, status_code=201)
async def checkout(data: CheckoutRequest, user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """Create a Stripe checkout session for the given items."""
    svc = PaymentService(db)
    result = await svc.create_checkout(user.id, [item.model_dump() for item in data.items])
    return CheckoutResponse(checkout_url=result["checkout_url"], order_id=result["order_id"])

@router.post("/webhook", status_code=200)
async def stripe_webhook(request: Request, stripe_signature: str = Header(alias="stripe-signature"), db: AsyncSession = Depends(get_db)):
    """Stripe webhook endpoint — no auth required, verified via signature."""
    payload = await request.body()
    svc = PaymentService(db)
    await svc.handle_webhook(payload, stripe_signature)
    return {"received": True}
