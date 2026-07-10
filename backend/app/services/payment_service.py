"""Payment service — Stripe checkout, webhook handling, order management."""
from __future__ import annotations
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import stripe
from app.core.config import get_settings
from app.core.exceptions import PaymentError, NotFoundError, ValidationError
from app.models.order import Order, OrderItem, OrderStatus, ItemType
from app.models.course import Course

class PaymentService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        settings = get_settings()
        stripe.api_key = settings.STRIPE_SECRET_KEY

    async def create_checkout(self, user_id: UUID, items: list[dict]) -> dict:
        """
        Create a Stripe checkout session and persist a pending Order.

        Args:
            user_id: The authenticated user's ID.
            items: List of dicts with item_type and item_id.

        Returns:
            Dict with checkout_url and order_id.

        Raises:
            NotFoundError: If a referenced item doesn't exist.
            PaymentError: If Stripe session creation fails.
        """
        line_items = []
        order_items_data = []
        total = 0.0

        for item in items:
            if item["item_type"] == "course":
                stmt = select(Course).where(Course.id == UUID(str(item["item_id"])))
                result = await self.db.execute(stmt)
                course = result.scalar_one_or_none()
                if course is None:
                    raise NotFoundError(resource="Course")
                line_items.append({
                    "price_data": {
                        "currency": course.currency.lower(),
                        "product_data": {"name": course.title},
                        "unit_amount": int(float(course.price) * 100),
                    },
                    "quantity": 1,
                })
                order_items_data.append({"item_type": ItemType.COURSE, "item_id": course.id, "unit_price": float(course.price), "quantity": 1})
                total += float(course.price)

        # Create pending order
        order = Order(user_id=user_id, total_amount=total, currency="USD")
        self.db.add(order)
        await self.db.flush()

        for oi_data in order_items_data:
            self.db.add(OrderItem(order_id=order.id, **oi_data))
        await self.db.flush()

        try:
            session = stripe.checkout.Session.create(
                line_items=line_items,
                mode="payment",
                success_url=f"{get_settings().ALLOWED_ORIGINS}/payment/success?order_id={order.id}",
                cancel_url=f"{get_settings().ALLOWED_ORIGINS}/payment/cancel",
                metadata={"order_id": str(order.id)},
            )
        except stripe.error.StripeError as e:
            raise PaymentError(message=str(e)) from e

        order.gateway_payment_id = session.id
        await self.db.commit()

        return {"checkout_url": session.url, "order_id": str(order.id)}

    async def handle_webhook(self, payload: bytes, sig_header: str) -> None:
        """
        Process a Stripe webhook event idempotently.

        Checks gateway_event_id to prevent duplicate processing.

        Raises:
            ValidationError: If signature verification fails.
        """
        settings = get_settings()
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
        except (ValueError, stripe.error.SignatureVerificationError) as e:
            raise ValidationError(message="Invalid webhook signature.") from e

        # Idempotency: check if we already processed this event
        stmt = select(Order).where(Order.gateway_event_id == event["id"])
        existing = (await self.db.execute(stmt)).scalar_one_or_none()
        if existing is not None:
            return  # Already processed

        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            order_id = session.get("metadata", {}).get("order_id")
            if order_id:
                stmt = select(Order).where(Order.id == UUID(order_id))
                order = (await self.db.execute(stmt)).scalar_one_or_none()
                if order:
                    order.status = OrderStatus.PAID
                    order.gateway_event_id = event["id"]
                    await self.db.commit()
                    # Enrollment creation is triggered separately after payment confirmation
