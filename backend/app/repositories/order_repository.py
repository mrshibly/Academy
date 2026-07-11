"""Order repository — orders, items, invoices DB queries."""
from __future__ import annotations
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.order import Order, OrderItem, Invoice

class OrderRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_order_by_id(self, order_id: UUID) -> Order | None:
        result = await self.db.execute(select(Order).where(Order.id == order_id))
        return result.scalar_one_or_none()

    async def get_order_by_event_id(self, event_id: str) -> Order | None:
        result = await self.db.execute(select(Order).where(Order.gateway_event_id == event_id))
        return result.scalar_one_or_none()

    async def create_order(self, **kwargs: object) -> Order:
        order = Order(**kwargs)
        self.db.add(order)
        await self.db.flush()
        return order

    async def create_order_item(self, **kwargs: object) -> OrderItem:
        item = OrderItem(**kwargs)
        self.db.add(item)
        await self.db.flush()
        return item

    async def list_order_items(self, order_id: UUID) -> list[OrderItem]:
        result = await self.db.execute(select(OrderItem).where(OrderItem.order_id == order_id))
        return list(result.scalars().all())

    async def list_invoices_by_org(self, org_id: UUID) -> list[Invoice]:
        result = await self.db.execute(
            select(Invoice).where(Invoice.organization_id == org_id).order_by(Invoice.created_at.desc())
        )
        return list(result.scalars().all())
