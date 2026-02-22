"""
Pet and Vehicle apps models for identifying dogs, cats, vehicles, and fish.
Each app specializes in different categories with detailed identification data.
"""
from sqlalchemy import (
    Column, String, Integer, Text, DateTime, ForeignKey, JSON, DECIMAL,
    CheckConstraint, Index, func, Boolean
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database.config import Base


class DogIdentification(Base):
    """Dog breed identification with canine data"""
    __tablename__ = "dog_identifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    photo_id = Column(UUID(as_uuid=True), ForeignKey("photos.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Basic identification
    breed = Column(String(255))
    breed_group = Column(String(100))  # sporting, hound, working, toy, etc.
    origin_country = Column(String(100))

    # Identification details
    confidence = Column(DECIMAL(3, 2), nullable=False, CheckConstraint("confidence >= 0 AND confidence <= 1"))
    model_version = Column(String(50))

    # Physical characteristics
    size = Column(String(50))  # toy, small, medium, large, giant
    weight_range = Column(String(50))  # e.g., "20-30 lbs"
    height_range = Column(String(50))  # e.g., "18-22 inches"
    coat_type = Column(String(100))  # short, long, curly, wirehair, etc.
    coat_colors = Column(ARRAY(String))
    shedding_level = Column(Integer)  # 1-5 scale
    hypoallergenic = Column(Boolean, default=False)

    # Temperament and behavior
    temperament = Column(JSONB, default=list)  # [friendly, energetic, loyal, etc.]
    energy_level = Column(String(50))  # low, moderate, high, very high
    trainability = Column(String(50))  # easy, moderate, challenging
    barking_level = Column(String(50))  # low, moderate, high
    good_with_children = Column(Boolean)
    good_with_other_dogs = Column(Boolean)
    good_with_cats = Column(Boolean)

    # Health and care
    life_expectancy = Column(String(50))  # e.g., "10-12 years"
    common_health_issues = Column(JSONB, default=list)
    grooming_needs = Column(String(50))  # low, moderate, high
    exercise_needs = Column(String(50))  # low, moderate, high

    # Additional metadata
    description = Column(Text)
    breed_history = Column(Text)
    famous_examples = Column(JSONB, default=list)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Indexes
    __table_args__ = (
        Index("idx_dog_breed", "breed"),
        Index("idx_dog_breed_group", "breed_group"),
        Index("idx_dog_size", "size"),
    )

    def __repr__(self):
        return f"<DogIdentification(id={self.id}, breed={self.breed}, size={self.size})>"


class CatIdentification(Base):
    """Cat breed identification with feline data"""
    __tablename__ = "cat_identifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    photo_id = Column(UUID(as_uuid=True), ForeignKey("photos.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Basic identification
    breed = Column(String(255))
    breed_group = Column(String(100))  # natural, semi-foreign, foreign, etc.
    origin_country = Column(String(100))

    # Identification details
    confidence = Column(DECIMAL(3, 2), nullable=False, CheckConstraint("confidence >= 0 AND confidence <= 1"))
    model_version = Column(String(50))

    # Physical characteristics
    size = Column(String(50))  # small, medium, large
    weight_range = Column(String(50))
    coat_length = Column(String(50))  # hairless, short, medium, long
    coat_pattern = Column(String(100))  # solid, tabby, bicolor, calico, etc.
    coat_colors = Column(ARRAY(String))
    eye_colors = Column(ARRAY(String))
    shedding_level = Column(Integer)  # 1-5 scale
    hypoallergenic = Column(Boolean, default=False)

    # Temperament and behavior
    temperament = Column(JSONB, default=list)  # [affectionate, independent, vocal, etc.]
    energy_level = Column(String(50))  # low, moderate, high
    affection_level = Column(String(50))  # low, moderate, high
    playfulness = Column(String(50))  # low, moderate, high
    vocalness = Column(String(50))  # quiet, moderate, chatty

    # Health and care
    life_expectancy = Column(String(50))
    common_health_issues = Column(JSONB, default=list)
    grooming_needs = Column(String(50))  # low, moderate, high
    activity_needs = Column(String(50))

    # Additional metadata
    description = Column(Text)
    breed_history = Column(Text)
    personality_traits = Column(JSONB, default=list)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Indexes
    __table_args__ = (
        Index("idx_cat_breed", "breed"),
        Index("idx_cat_breed_group", "breed_group"),
        Index("idx_cat_size", "size"),
    )

    def __repr__(self):
        return f"<CatIdentification(id={self.id}, breed={self.breed}, size={self.size})>"


class VehicleIdentification(Base):
    """Vehicle identification with automotive data"""
    __tablename__ = "vehicle_identifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    photo_id = Column(UUID(as_uuid=True), ForeignKey("photos.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Basic identification
    make = Column(String(100))  # Toyota, Ford, BMW, etc.
    model = Column(String(100))  # Camry, Mustang, M3, etc.
    year = Column(Integer)
    trim = Column(String(100))  # SE, GT, Luxury, etc.

    # Identification details
    confidence = Column(DECIMAL(3, 2), nullable=False, CheckConstraint("confidence >= 0 AND confidence <= 1"))
    model_version = Column(String(50))

    # Vehicle classification
    body_type = Column(String(50))  # sedan, SUV, coupe, truck, hatchback, etc.
    vehicle_class = Column(String(100))  # compact, mid-size, full-size, luxury, sports
    segment = Column(String(100))  # A, B, C, D, E, F, J, M, S
    drive_train = Column(String(50))  # FWD, RWD, AWD, 4WD

    # Specifications
    engine_type = Column(String(100))  # e.g., "2.5L Inline-4 Turbo"
    engine_size = Column(String(50))  # e.g., "2.5L"
    horsepower = Column(Integer)
    torque = Column(Integer)  # in lb-ft
    transmission = Column(String(100))  # 6-speed automatic, CVT, manual, etc.
    fuel_type = Column(String(50))  # gasoline, diesel, hybrid, electric, plug-in hybrid

    # Performance and economy
    fuel_economy_city = Column(Integer)  # MPG
    fuel_economy_highway = Column(Integer)  # MPG
    fuel_economy_combined = Column(Integer)  # MPG
    zero_to_sixty = Column(DECIMAL(4, 2))  # in seconds
    top_speed = Column(Integer)  # in mph

    # Exterior features
    exterior_colors = Column(ARRAY(String))
    wheel_size = Column(String(20))  # e.g., "18 inch"

    # Additional metadata
    description = Column(Text)
    notable_features = Column(Text)
    generation = Column(String(50))  # e.g., "10th generation"
    production_years = Column(String(50))  # e.g., "2018-2023"
    country_of_origin = Column(String(100))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Indexes
    __table_args__ = (
        Index("idx_vehicle_make", "make"),
        Index("idx_vehicle_model", "model"),
        Index("idx_vehicle_year", "year"),
        Index("idx_vehicle_body_type", "body_type"),
    )

    def __repr__(self):
        return f"<VehicleIdentification(id={self.id}, make={self.make}, model={self.model}, year={self.year})>"


class FishIdentification(Base):
    """Fish species identification with ichthyology data"""
    __tablename__ = "fish_identifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    photo_id = Column(UUID(as_uuid=True), ForeignKey("photos.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Basic identification
    common_name = Column(String(255))
    scientific_name = Column(String(255))
    fish_type = Column(String(100))  # freshwater, saltwater, brackish

    # Identification details
    confidence = Column(DECIMAL(3, 2), nullable=False, CheckConstraint("confidence >= 0 AND confidence <= 1"))
    model_version = Column(String(50))

    # Taxonomic classification
    family = Column(String(100))
    order_fish = Column(String(100))  # 'order' is reserved word
    class_fish = Column(String(100))  # 'class' is reserved word

    # Physical characteristics
    size = Column(String(100))  # e.g., "2-4 inches", "up to 2 feet"
    max_size = Column(String(100))
    weight = Column(String(100))
    body_shape = Column(String(100))  # streamlined, compressed, elongated
    color_pattern = Column(JSONB, default=dict)  # {primary, secondary, markings}
    distinct_features = Column(JSONB, default=list)  # [dorsal_fin_type, scale_pattern, etc.]

    # Habitat and behavior
    habitat_type = Column(String(100))  # coral_reef, open_ocean, river, lake, aquarium
    water_conditions = Column(JSONB, default=dict)  # {temperature, pH, hardness}
    swimming_level = Column(String(100))  # top, middle, bottom
    temperament = Column(String(50))  # peaceful, semi-aggressive, aggressive
    schooling = Column(Boolean, default=False)

    # Diet and care
    diet_type = Column(String(100))  # carnivore, herbivore, omnivore
    feeding_habits = Column(Text)
    difficulty_level = Column(String(50))  # easy, moderate, difficult
    aquarium_size = Column(String(100))  # minimum recommended tank size
    compatible_tankmates = Column(JSONB, default=list)

    # Additional metadata
    description = Column(Text)
    life_span = Column(String(50))
    conservation_status = Column(String(100))  # endangered, vulnerable, least_concern
    region = Column(String(255))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Indexes
    __table_args__ = (
        Index("idx_fish_common_name", "common_name"),
        Index("idx_fish_scientific_name", "scientific_name"),
        Index("idx_fish_fish_type", "fish_type"),
        Index("idx_fish_family", "family"),
    )

    def __repr__(self):
        return f"<FishIdentification(id={self.id}, common_name={self.common_name}, fish_type={self.fish_type})>"
