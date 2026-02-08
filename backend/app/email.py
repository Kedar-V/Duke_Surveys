from __future__ import annotations

import os
from typing import Iterable

import boto3


def send_edit_link_email(recipient: str, edit_url: str) -> None:
    sender = os.environ.get("SES_SENDER_EMAIL")
    if not sender:
        raise RuntimeError("SES_SENDER_EMAIL is not set")

    region = os.environ.get("AWS_REGION", os.environ.get("SES_REGION", "us-east-1"))
    subject = "Your project intake form edit link"
    text_body = (
        "Thank you for submitting your project intake form.\n\n"
        "You can edit your submission using the link below:\n"
        f"{edit_url}\n\n"
        "This link does not expire."
    )

    client = boto3.client("ses", region_name=region)
    client.send_email(
        Source=sender,
        Destination={"ToAddresses": [recipient]},
        Message={
            "Subject": {"Data": subject},
            "Body": {"Text": {"Data": text_body}},
        },
    )
