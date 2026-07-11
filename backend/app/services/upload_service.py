"""Upload service — handles file validation and storage."""
from __future__ import annotations
import uuid
import boto3
from fastapi import HTTPException
from app.core.config import get_settings

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf", "video/mp4"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB

class UploadService:
    async def upload_file(self, user_id: uuid.UUID, filename: str, content_type: str, contents: bytes) -> dict:
        """Validate size/MIME and upload to S3."""
        if content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(status_code=422, detail=f"Unsupported file type: {content_type}")

        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(status_code=422, detail="File exceeds maximum size of 50MB.")

        # Upload to S3
        settings = get_settings()
        s3_client = boto3.client(
            "s3",
            region_name=settings.S3_REGION,
            endpoint_url=settings.S3_ENDPOINT_URL,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        file_key = f"uploads/{user_id}/{uuid.uuid4()}/{filename}"
        s3_client.put_object(Bucket=settings.S3_BUCKET_NAME, Key=file_key, Body=contents, ContentType=content_type)

        file_url = (
            f"{settings.S3_ENDPOINT_URL}/{settings.S3_BUCKET_NAME}/{file_key}"
            if settings.S3_ENDPOINT_URL
            else f"https://{settings.S3_BUCKET_NAME}.s3.{settings.S3_REGION}.amazonaws.com/{file_key}"
        )

        return {"url": file_url, "filename": filename, "size": len(contents)}
