"""Payment routes — checkout and Stripe webhook."""
from __future__ import annotations
from fastapi import APIRouter, Depends, Request, Header, Form
from fastapi.responses import RedirectResponse
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.config import get_settings
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.models.order import Order, OrderStatus, ItemType
from app.schemas.order import CheckoutRequest, CheckoutResponse
from app.services.payment_service import PaymentService

router = APIRouter()

@router.post("/checkout", response_model=CheckoutResponse, status_code=201)
async def checkout(data: CheckoutRequest, user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """Create a Stripe or SSLCommerz checkout session for the given items."""
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

@router.post("/sslcommerz/success")
async def sslcommerz_success(
    order_id: UUID,
    status: str = Form(...),
    val_id: str = Form(...),
    amount: float = Form(...),
    db: AsyncSession = Depends(get_db)
):
    """Callback for successful SSLCommerz transactions."""
    if status == "VALID" or status == "VALIDATED":
        stmt = select(Order).where(Order.id == order_id).options(selectinload(Order.items))
        order = (await db.execute(stmt)).scalar_one_or_none()
        if order and order.status != OrderStatus.PAID:
            order.status = OrderStatus.PAID
            order.gateway_event_id = val_id
            
            from app.services.enrollment_service import EnrollmentService
            enroll_svc = EnrollmentService(db)
            for item in order.items:
                if item.item_type == ItemType.COURSE:
                    try:
                        await enroll_svc.enroll(order.user_id, item.item_id)
                    except Exception:
                        pass
            await db.commit()
            
    settings = get_settings()
    return RedirectResponse(url=f"{settings.ALLOWED_ORIGINS}/dashboard/student?payment=success", status_code=303)

@router.post("/sslcommerz/fail")
async def sslcommerz_fail(
    order_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Callback for failed SSLCommerz transactions."""
    settings = get_settings()
    return RedirectResponse(url=f"{settings.ALLOWED_ORIGINS}/academy?payment=failed", status_code=303)

@router.post("/sslcommerz/cancel")
async def sslcommerz_cancel(
    order_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Callback for cancelled SSLCommerz transactions."""
    settings = get_settings()
    return RedirectResponse(url=f"{settings.ALLOWED_ORIGINS}/academy?payment=cancelled", status_code=303)
