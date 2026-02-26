"""
Nature apps models for identifying plants, mushrooms, birds, and insects.
Each app extends the core Photo functionality with specialized identification data.
"""
from sqlalchemy import (
    Column, String, Integer, Text, DateTime, ForeignKey, JSON, DECIMAL, Boolean,
    CheckConstraint, Index, func
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database.config import Base


class PlantIdentification(Base):
    """Plant identification results with botanical data"""
    __tablename__ = "plant_identifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    photo_id = Column(UUID(as_uuid=True), ForeignKey("photos.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Scientific classification
    scientific_name = Column(String(255))
    common_name = Column(String(255))
    family = Column(String(255))
    genus = Column(String(255))
    species = Column(String(255))

    # Identification details
    confidence = Column(DECIMAL(3, 2), nullable=False, check="confidence >= 0 AND confidence <= 1")
    model_version = Column(String(50))

    # Plant characteristics
    characteristics = Column(JSONB, default=dict)  # {leaf_type, flower_color, height, growth_habit}
    toxicity = Column(String(50))  # toxic, non-toxic, unknown
    edibility = Column(String(50))  # edible, inedible, unknown

    # Additional metadata
    description = Column(Text)
    care_requirements = Column(JSONB, default=dict)  # {sunlight, water, soil_type}
    native_region = Column(String(255))
    blooming_season = Column(String(100))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Indexes
    __table_args__ = (
        Index("idx_plant_scientific_name", "scientific_name"),
        Index("idx_plant_common_name", "common_name"),
        Index("idx_plant_family", "family"),
    )

    def __repr__(self):
        return f"<PlantIdentification(id={self.id}, common_name={self.common_name}, confidence={self.confidence})>"


class MushroomIdentification(Base):
    """Mushroom identification results with mycology data"""
    __tablename__ = "mushroom_identifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    photo_id = Column(UUID(as_uuid=True), ForeignKey("photos.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Scientific classification
    scientific_name = Column(String(255))
    common_name = Column(String(255))
    family = Column(String(255))
    genus = Column(String(255))
    order_mycology = Column(String(255))  # 'order' is a reserved word

    # Identification details
    confidence = Column(DECIMAL(3, 2), nullable=False, check="confidence >= 0 AND confidence <= 1")
    model_version = Column(String(50))

    # Mushroom characteristics
    characteristics = Column(JSONB, default=dict)  # {cap_shape, cap_color, gill_type, stem_features}
    edibility = Column(String(50))  # edible, poisonous, inedible, unknown
    psychoactive = Column(Boolean, default=False)  # True if psychoactive species

    # Safety warnings
    toxicity_level = Column(String(50))  # deadly, highly_toxic, mildly_toxic, non_toxic
    look_alikes = Column(ARRAY(String))  # Similar species that might be confused

    # Additional metadata
    description = Column(Text)
    habitat = Column(String(255))  # {forest, grassland, deciduous, coniferous}
    season = Column(String(100))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Indexes
    __table_args__ = (
        Index("idx_mushroom_scientific_name", "scientific_name"),
        Index("idx_mushroom_common_name", "common_name"),
        Index("idx_mushroom_edibility", "edibility"),
    )

    def __repr__(self):
        return f"<MushroomIdentification(id={self.id}, common_name={self.common_name}, edibility={self.edibility})>"


class BirdIdentification(Base):
    """Bird identification results with ornithology data"""
    __tablename__ = "bird_identifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    photo_id = Column(UUID(as_uuid=True), ForeignKey("photos.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Scientific classification
    scientific_name = Column(String(255))
    common_name = Column(String(255))
    family = Column(String(255))
    order_bird = Column(String(255))  # 'order' is a reserved word

    # Identification details
    confidence = Column(DECIMAL(3, 2), nullable=False, check="confidence >= 0 AND confidence <= 1")
    model_version = Column(String(50))

    # Bird characteristics
    characteristics = Column(JSONB, default=dict)  # {size, beak_type, plumage, wing_span}
    gender = Column(String(50))  # male, female, unknown
    age = Column(String(50))  # adult, juvenile, unknown

    # Geographic and seasonal data
    habitat = Column(String(255))
    migration_status = Column(String(50))  # resident, migratory, partial_migrant
    range_description = Column(Text)
    season_spotted = Column(String(100))

    # Additional metadata
    description = Column(Text)
    behavior = Column(Text)  # Typical behaviors (feeding, nesting, etc.)
    conservation_status = Column(String(50))  # endangered, vulnerable, least_concern, etc.

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Indexes
    __table_args__ = (
        Index("idx_bird_scientific_name", "scientific_name"),
        Index("idx_bird_common_name", "common_name"),
        Index("idx_bird_family", "family"),
    )

    def __repr__(self):
        return f"<BirdIdentification(id={self.id}, common_name={self.common_name}, confidence={self.confidence})>"


class InsectIdentification(Base):
    """Insect identification results with entomology data"""
    __tablename__ = "insect_identifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    photo_id = Column(UUID(as_uuid=True), ForeignKey("photos.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Scientific classification
    scientific_name = Column(String(255))
    common_name = Column(String(255))
    family = Column(String(255))
    order_insect = Column(String(255))  # 'order' is a reserved word
    class_insect = Column(String(255))

    # Identification details
    confidence = Column(DECIMAL(3, 2), nullable=False, check="confidence >= 0 AND confidence <= 1")
    model_version = Column(String(50))

    # Insect characteristics
    characteristics = Column(JSONB, default=dict)  # {size, color, wings, antennae}
    life_stage = Column(String(50))  # egg, larva, pupa, adult
    gender = Column(String(50))  # male, female, unknown

    # Behavioral and ecological data
    habitat = Column(String(255))
    diet = Column(String(255))  # herbivore, carnivore, omnivore, etc.
    behavior = Column(Text)  # Social, solitary, predatory, etc.

    # Human interaction
    pest_status = Column(String(50))  # pest, beneficial, neutral
    danger_level = Column(String(50))  # dangerous, venomous, harmless
    venomous = Column(Boolean, default=False)

    # Additional metadata
    description = Column(Text)
    geographic_range = Column(Text)
    season_active = Column(String(100))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Indexes
    __table_args__ = (
        Index("idx_insect_scientific_name", "scientific_name"),
        Index("idx_insect_common_name", "common_name"),
        Index("idx_insect_family", "family"),
    )

    def __repr__(self):
        return f"<InsectIdentification(id={self.id}, common_name={self.common_name}, confidence={self.confidence})>"
