from __future__ import annotations

import os
import logging

import boto3


logger = logging.getLogger(__name__)


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

	try:
		client = boto3.client("ses", region_name=region)
		response = client.send_email(
			Source=sender,
			Destination={"ToAddresses": [recipient]},
			Message={
				"Subject": {"Data": subject},
				"Body": {"Text": {"Data": text_body}},
			},
		)
		logger.debug(
			"Successfully sent edit link email to %s, MessageId: %s",
			recipient,
			response.get("MessageId"),
		)
	except Exception as exc:
		logger.debug("Failed to send edit link email to %s: %s", recipient, str(exc))
		raise
