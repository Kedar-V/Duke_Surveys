from __future__ import annotations

import os
import uuid
from typing import Iterable

import boto3
from fastapi import UploadFile
from collections.abc import Iterable as ABCIterable


def _public_url(bucket: str, key: str, region: str) -> str:
    if region == "us-east-1":
        return f"https://{bucket}.s3.amazonaws.com/{key}"
    return f"https://{bucket}.s3.{region}.amazonaws.com/{key}"


def upload_documents(files: Iterable[UploadFile] | UploadFile) -> list[str]:
    # Normalise to a list of UploadFile
    if files is None:
        return []

    # Single UploadFile → wrap in list
    if isinstance(files, UploadFile):
        files_list = [files]
    # Already some iterable of UploadFile (list, tuple, etc.)
    elif isinstance(files, ABCIterable) and not isinstance(files, (str, bytes, dict)):
        files_list = list(files)
    else:
        # Fallback: treat as single
        files_list = [files]

    # Filter out Nones / empty filenames
    files_list = [f for f in files_list if f and getattr(f, "filename", None)]
    if not files_list:
        return []

    bucket = os.environ.get("S3_BUCKET", "app-capstone")
    region = os.environ.get("AWS_REGION", "us-east-1")
    prefix = os.environ.get("S3_PREFIX", "client-intake")
    s3 = boto3.client("s3", region_name=region)

    urls: list[str] = []
    for f in files_list:
        filename = os.path.basename(f.filename).replace(" ", "_")
        key = f"{prefix}/{uuid.uuid4().hex}_{filename}"
        extra_args = {"ContentType": f.content_type} if f.content_type else None

        if extra_args:
            s3.upload_fileobj(f.file, bucket, key, ExtraArgs=extra_args)
        else:
            s3.upload_fileobj(f.file, bucket, key)

        urls.append(_public_url(bucket, key, region))

    return urls
