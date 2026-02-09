from __future__ import annotations

import os
import logging
import smtplib
from email.message import EmailMessage


logger = logging.getLogger(__name__)


def send_edit_link_email(recipient: str, edit_url: str) -> None:
    sender = os.environ.get("SMTP_SENDER_EMAIL") or os.environ.get("SMTP_USER")
    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    smtp_user = os.environ.get("SMTP_USER")
    smtp_password = os.environ.get("SMTP_PASSWORD")

    if not sender:
        raise RuntimeError("SMTP_SENDER_EMAIL or SMTP_USER is not set")
    if not smtp_user or not smtp_password:
        raise RuntimeError("SMTP_USER or SMTP_PASSWORD is not set")

    subject = "Your project intake form edit link"
    text_body = (
        "Thank you for submitting your project intake form.\n\n"
        "You can edit your submission using the link below:\n"
        f"{edit_url}\n\n"
        "This link does not expire."
    )

    message = EmailMessage()
    message["From"] = sender
    message["To"] = recipient
    message["Subject"] = subject
    message.set_content(text_body)

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(message)
        logger.debug("Successfully sent edit link email to %s", recipient)
    except Exception as e:
        logger.debug("Failed to send edit link email to %s: %s", recipient, str(e))
        raise
