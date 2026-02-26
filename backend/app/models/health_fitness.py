"""
Health & Fitness apps models for identifying food, fruits, and exercises.
Each app focuses on different aspects of health, nutrition, and fitness.
"""
from sqlalchemy import (
    Column, String, Integer, Text, DateTime, ForeignKey, JSON, DECIMAL,
    CheckConstraint, Index, func
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database.config import Base


class CaloIdentification(Base):
    """Calorie and food identification for nutrition tracking"""
    __tablename__ = "calo_identifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    photo_id = Column(UUID(as_uuid=True), ForeignKey("photos.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Basic identification
    food_name = Column(String(255))
    food_category = Column(String(100))  # main_dish, side_dish, snack, beverage, dessert
    cuisine_type = Column(String(100))  # Italian, Mexican, Asian, American, etc.

    # Identification details
    confidence = Column(DECIMAL(3, 2), nullable=False, check="confidence >= 0 AND confidence <= 1")
    model_version = Column(String(50))

    # Serving information
    serving_size = Column(String(100))  # e.g., "1 cup", "100g", "1 piece"
    serving_weight_grams = Column(Integer)

    # Nutritional information (per serving)
    calories = Column(Integer)
    protein = Column(DECIMAL(6, 2))  # in grams
    carbohydrates = Column(DECIMAL(6, 2))  # in grams
    fats = Column(DECIMAL(6, 2))  # in grams
    fiber = Column(DECIMAL(6, 2))  # in grams
    sugar = Column(DECIMAL(6, 2))  # in grams
    sodium = Column(Integer)  # in milligrams
    cholesterol = Column(Integer)  # in milligrams

    # Vitamins and minerals
    vitamins = Column(JSONB, default=dict)  # {A: 500, C: 20, D: 10} in % DV
    minerals = Column(JSONB, default=dict)  # {iron: 15, calcium: 20} in % DV

    # Additional metadata
    description = Column(Text)
    ingredients = Column(JSONB, default=list)
    allergens = Column(ARRAY(String))  # dairy, nuts, gluten, etc.
    dietary_restrictions = Column(JSONB, default=dict)  # {vegan: false, vegetarian: true, gluten_free: false}
    preparation_method = Column(String(100))  # raw, cooked, fried, baked, etc.

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Indexes
    __table_args__ = (
        Index("idx_calo_food_name", "food_name"),
        Index("idx_calo_food_category", "food_category"),
        Index("idx_calo_cuisine_type", "cuisine_type"),
    )

    def __repr__(self):
        return f"<CaloIdentification(id={self.id}, food_name={self.food_name}, calories={self.calories})>"


class FruitIdentification(Base):
    """Fruit identification with nutritional and botanical data"""
    __tablename__ = "fruit_identifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    photo_id = Column(UUID(as_uuid=True), ForeignKey("photos.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Basic identification
    fruit_name = Column(String(255))
    scientific_name = Column(String(255))
    variety = Column(String(255))  # e.g., "Gala", "Fuji", "Honeycrisp"

    # Identification details
    confidence = Column(DECIMAL(3, 2), nullable=False, check="confidence >= 0 AND confidence <= 1")
    model_version = Column(String(50))

    # Botanical information
    fruit_type = Column(String(100))  # berry, drupe, pome, citrus, tropical
    family = Column(String(100))  # Rosaceae, Rutaceae, etc.
    genus = Column(String(100))

    # Serving information
    serving_size = Column(String(100))  # e.g., "1 medium", "100g", "1 cup"
    serving_weight_grams = Column(Integer)

    # Nutritional information (per serving)
    calories = Column(Integer)
    protein = Column(DECIMAL(6, 2))
    carbohydrates = Column(DECIMAL(6, 2))
    fats = Column(DECIMAL(6, 2))
    fiber = Column(DECIMAL(6, 2))
    sugar = Column(DECIMAL(6, 2))
    vitamin_c = Column(Integer)  # in milligrams

    # Fruit characteristics
    color = Column(ARRAY(String))
    flavor_profile = Column(String(100))  # sweet, tart, tangy, mild
    texture = Column(String(100))  # crisp, soft, juicy, fibrous
    ripeness_indicators = Column(JSONB, default=list)

    # Seasonal and geographic
    season = Column(String(100))
    origin_region = Column(String(255))
    growing_conditions = Column(Text)

    # Additional metadata
    description = Column(Text)
    health_benefits = Column(Text)
    storage_tips = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Indexes
    __table_args__ = (
        Index("idx_fruit_fruit_name", "fruit_name"),
        Index("idx_fruit_scientific_name", "scientific_name"),
        Index("idx_fruit_fruit_type", "fruit_type"),
    )

    def __repr__(self):
        return f"<FruitIdentification(id={self.id}, fruit_name={self.fruit_name}, variety={self.variety})>"


class LazyFitIdentification(Base):
    """Simple fitness identification for casual users and beginners"""
    __tablename__ = "lazyfit_identifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    photo_id = Column(UUID(as_uuid=True), ForeignKey("photos.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Basic identification
    activity_name = Column(String(255))
    activity_type = Column(String(100))  # exercise, pose, movement, stretch

    # Identification details
    confidence = Column(DECIMAL(3, 2), nullable=False, check="confidence >= 0 AND confidence <= 1")
    model_version = Column(String(50))

    # Activity details
    category = Column(String(100))  # cardio, strength, flexibility, balance, relaxation
    difficulty = Column(String(50))  # beginner, easy, moderate
    duration_minutes = Column(Integer)
    equipment_needed = Column(ARRAY(String))

    # Body focus
    muscle_groups = Column(ARRAY(String))  # arms, legs, core, back, etc.
    body_part = Column(String(100))

    # Simple instructions
    instructions = Column(Text)
    tips = Column(Text)
    common_mistakes = Column(Text)

    # Benefits
    benefits = Column(JSONB, default=list)
    calories_burned_est = Column(Integer)

    # Safety
    contraindications = Column(Text)  # people who should avoid this
    safety_notes = Column(Text)

    # Additional metadata
    description = Column(Text)
    alternative_variations = Column(JSONB, default=list)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Indexes
    __table_args__ = (
        Index("idx_lazyfit_activity_name", "activity_name"),
        Index("idx_lazyfit_activity_type", "activity_type"),
        Index("idx_lazyfit_category", "category"),
        Index("idx_lazyfit_difficulty", "difficulty"),
    )

    def __repr__(self):
        return f"<LazyFitIdentification(id={self.id}, activity_name={self.activity_name}, category={self.category})>"


class MuscleFitIdentification(Base):
    """Advanced muscle and exercise identification for fitness enthusiasts"""
    __tablename__ = "musclefit_identifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    photo_id = Column(UUID(as_uuid=True), ForeignKey("photos.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Basic identification
    exercise_name = Column(String(255))
    muscle_name = Column(String(255))  # if identifying a muscle
    identification_type = Column(String(50))  # exercise, muscle, anatomy

    # Identification details
    confidence = Column(DECIMAL(3, 2), nullable=False, check="confidence >= 0 AND confidence <= 1")
    model_version = Column(String(50))

    # Exercise-specific fields
    exercise_category = Column(String(100))  # compound, isolation, bodyweight, machine
    movement_pattern = Column(String(100))  # push, pull, squat, hinge, lunge, twist
    force_type = Column(String(50))  # push, pull, static
    difficulty_level = Column(String(50))  # beginner, intermediate, advanced

    # Muscle and anatomy details
    primary_muscles = Column(ARRAY(String))  # main muscles worked
    secondary_muscles = Column(ARRAY(String))  # supporting muscles
    muscle_group = Column(String(100))

    # Exercise specifications
    equipment_required = Column(ARRAY(String))  # dumbbells, barbell, cables, none
    rep_range = Column(String(50))  # e.g., "8-12", "15-20"
    set_count = Column(String(50))
    rest_between_sets = Column(String(50))

    # Technical details
    instructions = Column(Text)  # step-by-step
    form_tips = Column(Text)
    common_errors = Column(Text)
    progression = Column(Text)

    # Training data
    muscle_action = Column(String(100))  # concentric, eccentric, isometric
    plane_of_motion = Column(String(100))  # sagittal, frontal, transverse

    # Additional metadata
    description = Column(Text)
    variations = Column(JSONB, default=list)
    alternatives = Column(JSONB, default=list)
    muscle_anatomy_details = Column(JSONB, default=dict)  # origin, insertion, function

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Indexes
    __table_args__ = (
        Index("idx_musclefit_exercise_name", "exercise_name"),
        Index("idx_musclefit_muscle_name", "muscle_name"),
        Index("idx_musclefit_exercise_category", "exercise_category"),
        Index("idx_musclefit_primary_muscles", "primary_muscles", postgresql_using="gin"),
    )

    def __repr__(self):
        return f"<MuscleFitIdentification(id={self.id}, exercise_name={self.exercise_name}, primary_muscles={self.primary_muscles})>"
