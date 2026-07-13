"""Celery application configuration — uses Redis as broker and result backend."""
from __future__ import annotations
from celery import Celery
from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "academy",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.workers.tasks.email_tasks",
        "app.workers.tasks.certificate_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_publish_retry=False,
    broker_connection_timeout=2.0,
)
