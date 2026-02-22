"""Nutrition and fitness data models for health apps."""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class Meal(Base):
    """Model for tracking meals and nutrition data."""
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    food_name = Column(String(200), nullable=False)
    image_url = Column(String(500))
    calories = Column(Float, default=0)
    protein = Column(Float, default=0)  # grams
    carbs = Column(Float, default=0)   # grams
    fat = Column(Float, default=0)     # grams
    fiber = Column(Float, default=0)   # grams
    sugar = Column(Float, default=0)   # grams
    sodium = Column(Float, default=0)  # mg
    vitamins = Column(JSON, default={})  # vitamin info
    serving_size = Column(String(50), default="1 serving")
    meal_type = Column(String(50), default="snack")  # breakfast, lunch, dinner, snack
    notes = Column(Text)
    date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="meals")


class FruitLog(Base):
    """Model for tracking fruit consumption and ripeness data."""
    __tablename__ = "fruit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    fruit_name = Column(String(200), nullable=False)
    image_url = Column(String(500))
    ripeness_level = Column(String(50))  # unripe, ripe, overripe
    ripeness_score = Column(Float, default=0)  # 0-100 score
    calories = Column(Float, default=0)
    sugar_content = Column(Float, default=0)
    vitamin_c = Column(Float, default=0)
    fiber = Column(Float, default=0)
    origin = Column(String(100))
    season = Column(String(50))
    storage_recommendation = Column(Text)
    nutritional_benefits = Column(JSON, default={})
    consumption_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="fruit_logs")


class WorkoutSession(Base):
    """Model for tracking workout sessions."""
    __tablename__ = "workout_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    workout_type = Column(String(100))  # beginner, advanced, strength, cardio
    program_name = Column(String(200))
    exercise_name = Column(String(200))
    image_url = Column(String(500))
    form_score = Column(Float)  # 0-100 score
    form_feedback = Column(Text)
    rep_count = Column(Integer, default=0)
    sets_completed = Column(Integer, default=0)
    duration_minutes = Column(Integer, default=0)
    calories_burned = Column(Float, default=0)
    weight_used = Column(Float)  # kg or lbs
    muscle_groups = Column(JSON, default=[])  # list of targeted muscles
    difficulty_level = Column(String(50))  # easy, medium, hard
    notes = Column(Text)
    date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="workout_sessions")


class WorkoutProgram(Base):
    """Model for workout programs and progress tracking."""
    __tablename__ = "workout_programs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    program_name = Column(String(200), nullable=False)
    program_type = Column(String(100))  # lazyfit, musclefit
    description = Column(Text)
    exercises = Column(JSON, default=[])  # list of exercise objects
    target_muscle_groups = Column(JSON, default=[])
    difficulty_level = Column(String(50))
    estimated_duration = Column(Integer)  # minutes
    weekly_goal = Column(Integer, default=3)  # sessions per week
    is_active = Column(Boolean, default=True)
    progress_percentage = Column(Float, default=0)
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="workout_programs")


class NutritionGoal(Base):
    """Model for tracking daily nutrition goals."""
    __tablename__ = "nutrition_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    calorie_goal = Column(Float, default=2000)
    protein_goal = Column(Float, default=150)
    carbs_goal = Column(Float, default=200)
    fat_goal = Column(Float, default=70)
    fiber_goal = Column(Float, default=30)
    water_goal_ml = Column(Float, default=2000)
    calories_consumed = Column(Float, default=0)
    protein_consumed = Column(Float, default=0)
    carbs_consumed = Column(Float, default=0)
    fat_consumed = Column(Float, default=0)
    fiber_consumed = Column(Float, default=0)
    water_consumed_ml = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="nutrition_goals")


class FitnessProgress(Base):
    """Model for tracking overall fitness progress."""
    __tablename__ = "fitness_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    weight_kg = Column(Float)
    body_fat_percentage = Column(Float)
    muscle_mass_kg = Column(Float)
    workouts_completed = Column(Integer, default=0)
    total_calories_burned = Column(Float, default=0)
    total_workout_minutes = Column(Integer, default=0)
    average_form_score = Column(Float)
    strength_progress = Column(JSON, default={})  # exercise -> weight/reps progression
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="fitness_progress")
