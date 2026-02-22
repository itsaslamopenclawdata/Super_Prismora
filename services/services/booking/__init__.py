from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.config import get_settings
import uuid

settings = get_settings()
router = APIRouter(prefix="/api/v1/bookings", tags=["bookings"])


class Professional(BaseModel):
    """Healthcare professional."""

    id: Optional[str] = None
    name: str
    email: EmailStr
    specialization: str
    credentials: str
    bio: Optional[str] = None
    availability: dict = {}
    hourly_rate: float = Field(..., gt=0)


class ProfessionalCreate(BaseModel):
    """Create professional request."""

    name: str
    email: EmailStr
    specialization: str
    credentials: str
    bio: Optional[str] = None
    hourly_rate: float = Field(..., gt=0)


class Slot(BaseModel):
    """Available time slot."""

    id: Optional[str] = None
    professional_id: str
    start_time: datetime
    end_time: datetime
    available: bool = True


class Booking(BaseModel):
    """Appointment booking."""

    id: Optional[str] = None
    user_id: str
    professional_id: str
    slot_id: str
    status: Literal["pending", "confirmed", "completed", "cancelled", "no_show"] = "pending"
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class BookingCreate(BaseModel):
    """Create booking request."""

    user_id: str
    professional_id: str
    slot_id: str
    notes: Optional[str] = None


class BookingUpdate(BaseModel):
    """Update booking request."""

    status: Optional[Literal["pending", "confirmed", "completed", "cancelled", "no_show"]] = None
    notes: Optional[str] = None


class Availability(BaseModel):
    """Professional availability settings."""

    professional_id: str
    day_of_week: int = Field(..., ge=0, le=6)  # 0=Monday, 6=Sunday
    start_time: str  # HH:MM format
    end_time: str  # HH:MM format


# In-memory storage (replace with database in production)
professionals_store: dict[str, Professional] = {}
slots_store: dict[str, Slot] = {}
bookings_store: dict[str, Booking] = {}


@router.get("/professionals", response_model=List[Professional])
async def list_professionals(
    specialization: Optional[str] = None,
    available_only: bool = False,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """
    List healthcare professionals with filters.

    Supports filtering by specialization and availability.
    """
    professionals = list(professionals_store.values())

    # Apply filters
    if specialization:
        professionals = [p for p in professionals if p.specialization == specialization]

    if available_only:
        # Get professionals with available slots
        available_prof_ids = set(s.professional_id for s in slots_store.values() if s.available)
        professionals = [p for p in professionals if p.id in available_prof_ids]

    # Pagination
    total = len(professionals)
    professionals = professionals[offset:offset + limit]

    return professionals


@router.get("/professionals/{professional_id}", response_model=Professional)
async def get_professional(
    professional_id: str,
    db: Session = Depends(get_db),
):
    """Get details of a specific healthcare professional."""
    if professional_id not in professionals_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional not found",
        )

    return professionals_store[professional_id]


@router.post("/professionals", status_code=status.HTTP_201_CREATED, response_model=Professional)
async def create_professional(
    professional: ProfessionalCreate,
    db: Session = Depends(get_db),
):
    """Register a new healthcare professional."""
    professional_id = str(uuid.uuid4())

    new_professional = Professional(
        id=professional_id,
        **professional.dict(),
    )

    professionals_store[professional_id] = new_professional

    return new_professional


@router.get("/professionals/{professional_id}/slots", response_model=List[Slot])
async def list_available_slots(
    professional_id: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
):
    """
    List available time slots for a professional.

    Can filter by date range.
    """
    if professional_id not in professionals_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional not found",
        )

    slots = [s for s in slots_store.values() if s.professional_id == professional_id and s.available]

    # Apply date filters
    if start_date:
        slots = [s for s in slots if s.start_time >= start_date]
    if end_date:
        slots = [s for s in slots if s.end_time <= end_date]

    return slots


@router.post("/slots", status_code=status.HTTP_201_CREATED, response_model=Slot)
async def create_slot(
    professional_id: str,
    start_time: datetime,
    end_time: datetime,
    db: Session = Depends(get_db),
):
    """Create a new available time slot."""
    if professional_id not in professionals_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional not found",
        )

    if end_time <= start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time must be after start time",
        )

    slot_id = str(uuid.uuid4())

    new_slot = Slot(
        id=slot_id,
        professional_id=professional_id,
        start_time=start_time,
        end_time=end_time,
        available=True,
    )

    slots_store[slot_id] = new_slot

    return new_slot


@router.delete("/slots/{slot_id}")
async def delete_slot(
    slot_id: str,
    db: Session = Depends(get_db),
):
    """Delete a time slot."""
    if slot_id not in slots_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slot not found",
        )

    del slots_store[slot_id]

    return {"message": "Slot deleted successfully"}


@router.post("/bookings", status_code=status.HTTP_201_CREATED, response_model=Booking)
async def create_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db),
):
    """Create a new appointment booking."""
    # Validate professional
    if booking.professional_id not in professionals_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional not found",
        )

    # Validate slot
    if booking.slot_id not in slots_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slot not found",
        )

    slot = slots_store[booking.slot_id]

    # Check slot is available
    if not slot.available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slot is no longer available",
        )

    # Check if slot belongs to the specified professional
    if slot.professional_id != booking.professional_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slot does not belong to this professional",
        )

    # Create booking
    booking_id = str(uuid.uuid4())

    new_booking = Booking(
        id=booking_id,
        user_id=booking.user_id,
        professional_id=booking.professional_id,
        slot_id=booking.slot_id,
        status="pending",
        notes=booking.notes,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    # Mark slot as unavailable
    slot.available = False

    # Save booking
    bookings_store[booking_id] = new_booking

    return new_booking


@router.get("/bookings", response_model=List[Booking])
async def list_bookings(
    user_id: Optional[str] = None,
    professional_id: Optional[str] = None,
    status: Optional[Literal["pending", "confirmed", "completed", "cancelled", "no_show"]] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """List bookings with filters."""
    bookings = list(bookings_store.values())

    # Apply filters
    if user_id:
        bookings = [b for b in bookings if b.user_id == user_id]
    if professional_id:
        bookings = [b for b in bookings if b.professional_id == professional_id]
    if status:
        bookings = [b for b in bookings if b.status == status]

    # Sort by creation date descending
    bookings.sort(key=lambda x: x.created_at, reverse=True)

    # Pagination
    total = len(bookings)
    bookings = bookings[offset:offset + limit]

    return bookings


@router.get("/bookings/{booking_id}", response_model=Booking)
async def get_booking(
    booking_id: str,
    db: Session = Depends(get_db),
):
    """Get details of a specific booking."""
    if booking_id not in bookings_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    return bookings_store[booking_id]


@router.put("/bookings/{booking_id}", response_model=Booking)
async def update_booking(
    booking_id: str,
    booking_update: BookingUpdate,
    db: Session = Depends(get_db),
):
    """Update booking status or notes."""
    if booking_id not in bookings_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    booking = bookings_store[booking_id]

    # Update fields
    if booking_update.status:
        # If cancelling, free up the slot
        if booking_update.status == "cancelled" and booking.status != "cancelled":
            if booking.slot_id in slots_store:
                slots_store[booking.slot_id].available = True

        booking.status = booking_update.status

    if booking_update.notes is not None:
        booking.notes = booking_update.notes

    booking.updated_at = datetime.utcnow()

    return booking


@router.delete("/bookings/{booking_id}")
async def cancel_booking(
    booking_id: str,
    db: Session = Depends(get_db),
):
    """Cancel a booking."""
    if booking_id not in bookings_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    booking = bookings_store[booking_id]

    if booking.status in ["completed", "cancelled"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel a {booking.status} booking",
        )

    # Free up the slot
    if booking.slot_id in slots_store:
        slots_store[booking.slot_id].available = True

    # Update status
    booking.status = "cancelled"
    booking.updated_at = datetime.utcnow()

    return {"message": "Booking cancelled successfully"}


@router.get("/stats")
async def get_booking_stats(db: Session = Depends(get_db)):
    """Get booking statistics."""
    total_bookings = len(bookings_store)
    total_professionals = len(professionals_store)

    bookings_by_status = {}
    for booking in bookings_store.values():
        bookings_by_status[booking.status] = bookings_by_status.get(booking.status, 0) + 1

    # Calculate revenue (completed bookings)
    revenue = 0.0
    for booking in bookings_store.values():
        if booking.status == "completed" and booking.professional_id in professionals_store:
            professional = professionals_store[booking.professional_id]
            if booking.slot_id in slots_store:
                slot = slots_store[booking.slot_id]
                duration = (slot.end_time - slot.start_time).total_seconds() / 3600  # hours
                revenue += professional.hourly_rate * duration

    return {
        "professionals": total_professionals,
        "bookings": {
            "total": total_bookings,
            "by_status": bookings_by_status,
            "revenue": round(revenue, 2),
        },
    }


@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Check booking service health."""
    return {
        "service": "booking",
        "status": "healthy",
        "enabled": settings.TELEHEALTH_ENABLED,
        "professionals_count": len(professionals_store),
        "bookings_count": len(bookings_store),
    }
