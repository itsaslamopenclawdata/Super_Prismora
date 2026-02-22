from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Any
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.config import get_settings
import json

settings = get_settings()
router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])


class Event(BaseModel):
    """Analytics event."""

    event_type: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    properties: Optional[dict] = {}
    timestamp: Optional[datetime] = None


class BulkEvents(BaseModel):
    """Multiple analytics events."""

    events: List[Event]


class AnalyticsQuery(BaseModel):
    """Query for analytics data."""

    event_type: Optional[str] = None
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    limit: int = 100


class AnalyticsStats(BaseModel):
    """Analytics statistics."""

    total_events: int
    unique_users: int
    unique_sessions: int
    event_types: dict


# In-memory event storage (replace with proper database in production)
events_store: List[dict] = []


async def track_event(event: Event):
    """Track an analytics event."""
    event_dict = {
        "event_type": event.event_type,
        "user_id": event.user_id,
        "session_id": event.session_id,
        "properties": event.properties or {},
        "timestamp": event.timestamp or datetime.utcnow(),
    }

    events_store.append(event_dict)

    # In production, would save to database or analytics service
    print(f"Event tracked: {event_dict}")


@router.post("/track", status_code=status.HTTP_201_CREATED)
async def track_event_endpoint(
    event: Event,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Track a single analytics event.

    Common event types:
    - page_view: User viewed a page
    - photo_upload: User uploaded a photo
    - photo_identified: Photo was identified
    - search_performed: User performed a search
    - collection_created: User created a collection
    - user_signup: New user signed up
    """
    background_tasks.add_task(track_event, event)

    return {
        "status": "tracked",
        "event_type": event.event_type,
        "timestamp": event.timestamp or datetime.utcnow(),
    }


@router.post("/track/bulk", status_code=status.HTTP_201_CREATED)
async def track_bulk_events(
    events: BulkEvents,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Track multiple analytics events at once.
    """
    tracked_count = 0

    for event in events.events:
        background_tasks.add_task(track_event, event)
        tracked_count += 1

    return {
        "status": "tracked",
        "count": tracked_count,
    }


@router.get("/events", response_model=List[Event])
async def get_events(
    event_type: Optional[str] = None,
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """
    Query analytics events with filters.

    Supports filtering by event type, user, session, and date range.
    """
    filtered_events = []

    for event in events_store:
        # Apply filters
        if event_type and event["event_type"] != event_type:
            continue
        if user_id and event["user_id"] != user_id:
            continue
        if session_id and event["session_id"] != session_id:
            continue
        if start_date and event["timestamp"] < start_date:
            continue
        if end_date and event["timestamp"] > end_date:
            continue

        filtered_events.append(Event(**event))

    # Sort by timestamp descending and limit
    filtered_events.sort(key=lambda x: x.timestamp, reverse=True)

    return filtered_events[:limit]


@router.get("/stats")
async def get_analytics_stats(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
):
    """
    Get analytics statistics.

    Returns total events, unique users, sessions, and event type breakdown.
    """
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=7)
    if not end_date:
        end_date = datetime.utcnow()

    filtered_events = [
        e
        for e in events_store
        if start_date <= e["timestamp"] <= end_date
    ]

    unique_users = set(e["user_id"] for e in filtered_events if e["user_id"])
    unique_sessions = set(e["session_id"] for e in filtered_events if e["session_id"])

    event_types = {}
    for event in filtered_events:
        event_type = event["event_type"]
        event_types[event_type] = event_types.get(event_type, 0) + 1

    return AnalyticsStats(
        total_events=len(filtered_events),
        unique_users=len(unique_users),
        unique_sessions=len(unique_sessions),
        event_types=event_types,
    )


@router.get("/users/{user_id}/activity")
async def get_user_activity(
    user_id: str,
    days: int = 7,
    db: Session = Depends(get_db),
):
    """
    Get activity for a specific user.

    Returns events, session information, and activity summary.
    """
    start_date = datetime.utcnow() - timedelta(days=days)

    user_events = [
        e
        for e in events_store
        if e["user_id"] == user_id and e["timestamp"] >= start_date
    ]

    # Calculate activity metrics
    sessions = set(e["session_id"] for e in user_events if e["session_id"])
    event_types = {}

    for event in user_events:
        event_type = event["event_type"]
        event_types[event_type] = event_types.get(event_type, 0) + 1

    return {
        "user_id": user_id,
        "period_days": days,
        "total_events": len(user_events),
        "unique_sessions": len(sessions),
        "event_types": event_types,
        "recent_activity": user_events[:10],
    }


@router.get("/sessions/{session_id}/events")
async def get_session_events(
    session_id: str,
    db: Session = Depends(get_db),
):
    """
    Get all events for a specific session.
    """
    session_events = [e for e in events_store if e["session_id"] == session_id]

    if not session_events:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    # Sort by timestamp
    session_events.sort(key=lambda x: x["timestamp"])

    # Calculate session metrics
    start_time = min(e["timestamp"] for e in session_events)
    end_time = max(e["timestamp"] for e in session_events)
    duration = (end_time - start_time).total_seconds() / 60  # minutes

    return {
        "session_id": session_id,
        "start_time": start_time,
        "end_time": end_time,
        "duration_minutes": round(duration, 2),
        "total_events": len(session_events),
        "events": session_events,
    }


@router.get("/funnel")
async def get_funnel_analysis(
    steps: str = Field(..., description="Comma-separated event types for funnel"),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
):
    """
    Analyze user funnel through specified steps.

    Example: /funnel?steps=page_view,photo_upload,photo_identified
    """
    step_events = steps.split(",")

    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()

    # Get events within date range
    filtered_events = [
        e
        for e in events_store
        if start_date <= e["timestamp"] <= end_date
    ]

    # Calculate funnel
    funnel = {}
    for step in step_events:
        step_count = sum(1 for e in filtered_events if e["event_type"] == step)
        funnel[step] = step_count

    # Calculate conversion rates
    conversion_rates = {}
    if funnel:
        first_step_count = funnel.get(step_events[0], 0)

        for step, count in funnel.items():
            if first_step_count > 0:
                conversion_rates[step] = round((count / first_step_count) * 100, 2)

    return {
        "steps": step_events,
        "funnel": funnel,
        "conversion_rates": conversion_rates,
        "date_range": {
            "start": start_date,
            "end": end_date,
        },
    }


@router.get("/retention")
async def get_retention(
    cohort_date: datetime = Field(..., description="Cohet date (signup date)"),
    periods: int = Field(7, description="Number of periods to analyze"),
    db: Session = Depends(get_db),
):
    """
    Calculate user retention for a cohort.

    Returns retention percentage for each period after signup.
    """
    # Get users who signed up on the cohort date
    signup_events = [
        e
        for e in events_store
        if e["event_type"] == "user_signup" and e["timestamp"].date() == cohort_date.date()
    ]

    cohort_users = set(e["user_id"] for e in signup_events if e["user_id"])

    if not cohort_users:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No users found for cohort date {cohort_date.date()}",
        )

    # Calculate retention for each period
    retention = {}
    for period in range(1, periods + 1):
        period_start = cohort_date + timedelta(days=period)
        period_end = period_start + timedelta(days=1)

        # Get users who had any event in this period
        retained_users = set()

        for event in events_store:
            if (
                event["user_id"] in cohort_users
                and period_start <= event["timestamp"] < period_end
            ):
                retained_users.add(event["user_id"])

        retention_rate = (len(retained_users) / len(cohort_users)) * 100
        retention[f"day_{period}"] = round(retention_rate, 2)

    return {
        "cohort_date": cohort_date.date(),
        "cohort_size": len(cohort_users),
        "retention_periods": periods,
        "retention": retention,
    }


@router.get("/export")
async def export_analytics(
    start_date: datetime = Field(...),
    end_date: datetime = Field(...),
    event_type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Export analytics data as JSON.

    Useful for data pipelines and external analysis.
    """
    filtered_events = [
        e
        for e in events_store
        if start_date <= e["timestamp"] <= end_date and (not event_type or e["event_type"] == event_type)
    ]

    return {
        "export_date": datetime.utcnow(),
        "date_range": {
            "start": start_date,
            "end": end_date,
        },
        "total_events": len(filtered_events),
        "events": filtered_events,
    }


@router.delete("/events")
async def clear_events(
    confirm: bool = False,
    db: Session = Depends(get_db),
):
    """
    Clear all analytics events.

    WARNING: This is destructive and cannot be undone.
    """
    if not confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must confirm deletion with ?confirm=true",
        )

    global events_store
    cleared_count = len(events_store)
    events_store = []

    return {
        "status": "cleared",
        "events_deleted": cleared_count,
    }


@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Check analytics service health."""
    return {
        "service": "analytics",
        "status": "healthy",
        "events_count": len(events_store),
    }
