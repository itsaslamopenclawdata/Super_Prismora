"""
Core platform models for PhotoIdentifier.
These are the fundamental tables that support all apps in the platform.
"""
from sqlalchemy import (
    Column, String, Integer, BigInteger, Text, DECIMAL, DateTime,
    ForeignKey, JSON, ARRAY, CheckConstraint, Index, func
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database.config import Base


class User(Base):
    """Platform users table"""
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255))
    avatar = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    preferences = Column(JSONB, default=lambda: {
        "theme": "auto",
        "language": "en",
        "notifications": {
            "email": True,
            "push": False,
            "processingComplete": True,
            "weeklySummary": False
        }
    })

    # Relationships
    photos = relationship("Photo", back_populates="user", cascade="all, delete-orphan")
    collections = relationship("Collection", back_populates="user", cascade="all, delete-orphan")
    meals = relationship("Meal", back_populates="user", cascade="all, delete-orphan")
    fruit_logs = relationship("FruitLog", back_populates="user", cascade="all, delete-orphan")
    workout_sessions = relationship("WorkoutSession", back_populates="user", cascade="all, delete-orphan")
    workout_programs = relationship("WorkoutProgram", back_populates="user", cascade="all, delete-orphan")
    nutrition_goals = relationship("NutritionGoal", back_populates="user", cascade="all, delete-orphan")
    fitness_progress = relationship("FitnessProgress", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"


class Photo(Base):
    """Photos table for storing uploaded images"""
    __tablename__ = "photos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(500), nullable=False)
    original_url = Column(String(1000), nullable=False)
    thumbnail_url = Column(String(1000))
    size = Column(BigInteger, nullable=False)
    width = Column(Integer, nullable=False)
    height = Column(Integer, nullable=False)
    format = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    tags = Column(ARRAY(String), default=list)
    metadata = Column(JSONB, default=dict)
    status = Column(
        String(50),
        default="pending",
        nullable=False,
        CheckConstraint("status IN ('pending', 'processing', 'completed', 'failed')")
    )

    # Indexes
    __table_args__ = (
        Index("idx_photos_status", "status"),
        Index("idx_photos_tags", "tags", postgresql_using="gin"),
    )

    # Relationships
    user = relationship("User", back_populates="photos")
    identifications = relationship("PhotoIdentification", back_populates="photo", cascade="all, delete-orphan")
    collection_associations = relationship("CollectionPhoto", back_populates="photo", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Photo(id={self.id}, filename={self.filename}, status={self.status})>"


class PhotoIdentification(Base):
    """AI-powered photo identification results"""
    __tablename__ = "photo_identifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    photo_id = Column(UUID(as_uuid=True), ForeignKey("photos.id", ondelete="CASCADE"), nullable=False, index=True)
    model = Column(String(255), nullable=False)
    confidence = Column(DECIMAL(3, 2), nullable=False, CheckConstraint("confidence >= 0 AND confidence <= 1"))
    labels = Column(JSONB, default=list)
    objects = Column(JSONB, default=list)
    faces = Column(JSONB, default=list)
    text = Column(JSONB)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    photo = relationship("Photo", back_populates="identifications")

    def __repr__(self):
        return f"<PhotoIdentification(id={self.id}, model={self.model}, confidence={self.confidence})>"


class Collection(Base):
    """User collections for organizing photos"""
    __tablename__ = "collections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    cover_photo_id = Column(UUID(as_uuid=True), ForeignKey("photos.id", ondelete="SET NULL"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="collections")
    cover_photo = relationship("Photo", foreign_keys=[cover_photo_id])
    photo_associations = relationship("CollectionPhoto", back_populates="collection", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Collection(id={self.id}, name={self.name})>"


class CollectionPhoto(Base):
    """Junction table for many-to-many relationship between collections and photos"""
    __tablename__ = "collection_photos"

    collection_id = Column(
        UUID(as_uuid=True),
        ForeignKey("collections.id", ondelete="CASCADE"),
        primary_key=True
    )
    photo_id = Column(
        UUID(as_uuid=True),
        ForeignKey("photos.id", ondelete="CASCADE"),
        primary_key=True
    )
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    collection = relationship("Collection", back_populates="photo_associations")
    photo = relationship("Photo", back_populates="collection_associations")

    def __repr__(self):
        return f"<CollectionPhoto(collection_id={self.collection_id}, photo_id={self.photo_id})>"
