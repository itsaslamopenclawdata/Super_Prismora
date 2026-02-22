from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Literal
from sqlalchemy.orm import Session
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.database import get_db
from app.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])


class EmailRequest(BaseModel):
    """Email notification request."""

    to: EmailStr
    subject: str
    body: str
    html_body: Optional[str] = None
    priority: Literal["low", "normal", "high"] = "normal"


class BulkEmailRequest(BaseModel):
    """Bulk email notification request."""

    to: List[EmailStr]
    subject: str
    body: str
    html_body: Optional[str] = None
    priority: Literal["low", "normal", "high"] = "normal"


class SMSRequest(BaseModel):
    """SMS notification request."""

    to: str  # Phone number in E.164 format
    message: str


class PushNotificationRequest(BaseModel):
    """Push notification request."""

    user_id: str
    title: str
    body: str
    data: Optional[dict] = None


class NotificationStatus(BaseModel):
    """Notification status response."""

    id: str
    type: str
    status: Literal["pending", "sent", "failed"]
    recipient: str
    sent_at: Optional[str] = None
    error: Optional[str] = None


async def send_email(to: str, subject: str, body: str, html_body: Optional[str] = None) -> bool:
    """
    Send an email notification.

    Returns True if successful, False otherwise.
    """
    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = settings.EMAIL_FROM
        msg["To"] = to
        msg["Subject"] = subject

        # Attach plain text version
        text_part = MIMEText(body, "plain")
        msg.attach(text_part)

        # Attach HTML version if provided
        if html_body:
            html_part = MIMEText(html_body, "html")
            msg.attach(html_part)

        # Send email
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)

        return True

    except Exception as e:
        print(f"Failed to send email to {to}: {str(e)}")
        return False


async def send_sms(to: str, message: str) -> bool:
    """
    Send an SMS notification.

    Note: This is a placeholder. Integrate with SMS provider
    like Twilio, SNS, or MessageBird in production.
    """
    # Placeholder - implement with actual SMS provider
    print(f"SMS to {to}: {message}")
    return True


async def send_push_notification(user_id: str, title: str, body: str, data: Optional[dict] = None) -> bool:
    """
    Send a push notification.

    Note: This is a placeholder. Integrate with FCM, APNs,
    or push service provider in production.
    """
    # Placeholder - implement with actual push provider
    print(f"Push to user {user_id}: {title} - {body}")
    return True


@router.post("/email", status_code=status.HTTP_201_CREATED)
async def send_email_notification(
    request: EmailRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Send an email notification.

    The email is sent in the background. Returns immediately.
    """
    notification_id = f"email_{hash(request.to + request.subject)}"

    background_tasks.add_task(
        send_email,
        to=request.to,
        subject=request.subject,
        body=request.body,
        html_body=request.html_body,
    )

    return {
        "id": notification_id,
        "type": "email",
        "status": "pending",
        "recipient": request.to,
        "message": "Email queued for delivery",
    }


@router.post("/email/bulk", status_code=status.HTTP_201_CREATED)
async def send_bulk_email_notification(
    request: BulkEmailRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Send bulk email notifications.

    Emails are sent in the background. Returns immediately.
    """
    results = []

    for recipient in request.to:
        notification_id = f"email_{hash(recipient + request.subject)}"

        background_tasks.add_task(
            send_email,
            to=recipient,
            subject=request.subject,
            body=request.body,
            html_body=request.html_body,
        )

        results.append({
            "id": notification_id,
            "recipient": recipient,
            "status": "pending",
        })

    return {
        "type": "bulk_email",
        "count": len(request.to),
        "status": "pending",
        "results": results,
    }


@router.post("/sms", status_code=status.HTTP_201_CREATED)
async def send_sms_notification(
    request: SMSRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Send an SMS notification.

    The SMS is sent in the background. Returns immediately.
    """
    notification_id = f"sms_{hash(request.to + request.message)}"

    background_tasks.add_task(
        send_sms,
        to=request.to,
        message=request.message,
    )

    return {
        "id": notification_id,
        "type": "sms",
        "status": "pending",
        "recipient": request.to,
        "message": "SMS queued for delivery",
    }


@router.post("/push", status_code=status.HTTP_201_CREATED)
async def send_push_notification_endpoint(
    request: PushNotificationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Send a push notification.

    The notification is sent in the background. Returns immediately.
    """
    notification_id = f"push_{hash(request.user_id + request.title)}"

    background_tasks.add_task(
        send_push_notification,
        user_id=request.user_id,
        title=request.title,
        body=request.body,
        data=request.data,
    )

    return {
        "id": notification_id,
        "type": "push",
        "status": "pending",
        "recipient": request.user_id,
        "message": "Push notification queued for delivery",
    }


@router.get("/templates")
async def list_notification_templates(db: Session = Depends(get_db)):
    """
    List available notification templates.

    Templates are predefined messages for common notifications.
    """
    templates = {
        "welcome": {
            "subject": "Welcome to PhotoIdentifier!",
            "body": "Thank you for signing up. Start identifying your photos today!",
        },
        "password_reset": {
            "subject": "Reset Your Password",
            "body": "Click the link below to reset your password: {reset_link}",
        },
        "photo_identified": {
            "subject": "Your photo has been identified!",
            "body": "We've identified your photo. It appears to be: {identification}",
        },
        "collection_shared": {
            "subject": "A collection was shared with you",
            "body": "{user} shared the '{collection}' collection with you.",
        },
        "new_feature": {
            "subject": "New Feature Available!",
            "body": "We've added {feature} to PhotoIdentifier. Try it out!",
        },
    }

    return {
        "templates": templates,
        "count": len(templates),
    }


@router.post("/templates/{template_name}")
async def send_template_notification(
    template_name: str,
    to: EmailStr,
    context: Optional[dict] = None,
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db),
):
    """
    Send a notification using a predefined template.

    The template variables can be customized using the context parameter.
    """
    templates = {
        "welcome": {
            "subject": "Welcome to PhotoIdentifier!",
            "body": "Thank you for signing up. Start identifying your photos today!",
        },
        "password_reset": {
            "subject": "Reset Your Password",
            "body": "Click the link below to reset your password: {reset_link}",
        },
        "photo_identified": {
            "subject": "Your photo has been identified!",
            "body": "We've identified your photo. It appears to be: {identification}",
        },
        "collection_shared": {
            "subject": "A collection was shared with you",
            "body": "{user} shared the '{collection}' collection with you.",
        },
        "new_feature": {
            "subject": "New Feature Available!",
            "body": "We've added {feature} to PhotoIdentifier. Try it out!",
        },
    }

    if template_name not in templates:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template '{template_name}' not found",
        )

    template = templates[template_name]

    # Replace template variables with context values
    subject = template["subject"]
    body = template["body"]

    if context:
        for key, value in context.items():
            subject = subject.replace(f"{{{key}}}", str(value))
            body = body.replace(f"{{{key}}}", str(value))

    notification_id = f"email_{hash(to + subject)}"

    background_tasks.add_task(
        send_email,
        to=to,
        subject=subject,
        body=body,
    )

    return {
        "id": notification_id,
        "type": "email",
        "template": template_name,
        "status": "pending",
        "recipient": to,
        "message": "Template notification queued for delivery",
    }


@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Check notification service health."""
    smtp_status = "available" if settings.SMTP_HOST else "not_configured"

    return {
        "service": "notification",
        "status": "healthy",
        "providers": {
            "email": smtp_status,
            "sms": "available",
            "push": "available",
        },
    }
