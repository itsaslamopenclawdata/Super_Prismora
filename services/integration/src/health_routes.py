"""API routes for nutrition and fitness data."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from backend.app.database import get_db
from backend.app.models.nutrition import Meal, FruitLog, WorkoutSession, WorkoutProgram, NutritionGoal, FitnessProgress
from backend.app.models.user import User
from pydantic import BaseModel
import json

router = APIRouter(prefix="/api/health", tags=["health"])


# Pydantic models for request/response
class MealCreate(BaseModel):
    food_name: str
    image_url: Optional[str] = None
    calories: float = 0
    protein: float = 0
    carbs: float = 0
    fat: float = 0
    fiber: float = 0
    sugar: float = 0
    sodium: float = 0
    vitamins: dict = {}
    serving_size: str = "1 serving"
    meal_type: str = "snack"
    notes: Optional[str] = None


class MealResponse(BaseModel):
    id: int
    user_id: int
    food_name: str
    image_url: Optional[str]
    calories: float
    protein: float
    carbs: float
    fat: float
    fiber: float
    sugar: float
    sodium: float
    vitamins: dict
    serving_size: str
    meal_type: str
    notes: Optional[str]
    date: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class FruitLogCreate(BaseModel):
    fruit_name: str
    image_url: Optional[str] = None
    ripeness_level: Optional[str] = None
    ripeness_score: float = 0
    calories: float = 0
    sugar_content: float = 0
    vitamin_c: float = 0
    fiber: float = 0
    origin: Optional[str] = None
    season: Optional[str] = None
    storage_recommendation: Optional[str] = None
    nutritional_benefits: dict = {}


class FruitLogResponse(BaseModel):
    id: int
    user_id: int
    fruit_name: str
    image_url: Optional[str]
    ripeness_level: Optional[str]
    ripeness_score: float
    calories: float
    sugar_content: float
    vitamin_c: float
    fiber: float
    origin: Optional[str]
    season: Optional[str]
    storage_recommendation: Optional[str]
    nutritional_benefits: dict
    consumption_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class WorkoutSessionCreate(BaseModel):
    workout_type: str
    program_name: Optional[str] = None
    exercise_name: str
    image_url: Optional[str] = None
    form_score: Optional[float] = None
    form_feedback: Optional[str] = None
    rep_count: int = 0
    sets_completed: int = 0
    duration_minutes: int = 0
    calories_burned: float = 0
    weight_used: Optional[float] = None
    muscle_groups: List[str] = []
    difficulty_level: Optional[str] = None
    notes: Optional[str] = None


class WorkoutSessionResponse(BaseModel):
    id: int
    user_id: int
    workout_type: str
    program_name: Optional[str]
    exercise_name: str
    image_url: Optional[str]
    form_score: Optional[float]
    form_feedback: Optional[str]
    rep_count: int
    sets_completed: int
    duration_minutes: int
    calories_burned: float
    weight_used: Optional[float]
    muscle_groups: List[str]
    difficulty_level: Optional[str]
    notes: Optional[str]
    date: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class WorkoutProgramCreate(BaseModel):
    program_name: str
    program_type: str
    description: Optional[str] = None
    exercises: List[dict] = []
    target_muscle_groups: List[str] = []
    difficulty_level: Optional[str] = None
    estimated_duration: int = 30
    weekly_goal: int = 3
    is_active: bool = True


class WorkoutProgramResponse(BaseModel):
    id: int
    user_id: int
    program_name: str
    program_type: str
    description: Optional[str]
    exercises: List[dict]
    target_muscle_groups: List[str]
    difficulty_level: Optional[str]
    estimated_duration: int
    weekly_goal: int
    is_active: bool
    progress_percentage: float
    start_date: datetime
    end_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NutritionGoalCreate(BaseModel):
    date: Optional[datetime] = None
    calorie_goal: float = 2000
    protein_goal: float = 150
    carbs_goal: float = 200
    fat_goal: float = 70
    fiber_goal: float = 30
    water_goal_ml: float = 2000


class NutritionGoalResponse(BaseModel):
    id: int
    user_id: int
    date: datetime
    calorie_goal: float
    protein_goal: float
    carbs_goal: float
    fat_goal: float
    fiber_goal: float
    water_goal_ml: float
    calories_consumed: float
    protein_consumed: float
    carbs_consumed: float
    fat_consumed: float
    fiber_consumed: float
    water_consumed_ml: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FitnessProgressCreate(BaseModel):
    date: Optional[datetime] = None
    weight_kg: Optional[float] = None
    body_fat_percentage: Optional[float] = None
    muscle_mass_kg: Optional[float] = None
    workouts_completed: int = 0
    total_calories_burned: float = 0
    total_workout_minutes: int = 0
    average_form_score: Optional[float] = None
    strength_progress: dict = {}
    notes: Optional[str] = None


class FitnessProgressResponse(BaseModel):
    id: int
    user_id: int
    date: datetime
    weight_kg: Optional[float]
    body_fat_percentage: Optional[float]
    muscle_mass_kg: Optional[float]
    workouts_completed: int
    total_calories_burned: float
    total_workout_minutes: int
    average_form_score: Optional[float]
    strength_progress: dict
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# Helper function to get current user (simplified)
def get_current_user_id():
    # In a real app, this would use JWT authentication
    return 1  # Default to user ID 1 for development


# ============== MEALS ==============
@router.post("/meals", response_model=MealResponse, status_code=status.HTTP_201_CREATED)
async def create_meal(meal: MealCreate, db: Session = Depends(get_db)):
    user_id = get_current_user_id()
    db_meal = Meal(**meal.model_dump(), user_id=user_id)
    db.add(db_meal)
    db.commit()
    db.refresh(db_meal)

    # Update daily nutrition goal
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    goal = db.query(NutritionGoal).filter(
        NutritionGoal.user_id == user_id,
        NutritionGoal.date == today
    ).first()

    if goal:
        goal.calories_consumed += meal.calories
        goal.protein_consumed += meal.protein
        goal.carbs_consumed += meal.carbs
        goal.fat_consumed += meal.fat
        goal.fiber_consumed += meal.fiber
        db.commit()

    return db_meal


@router.get("/meals", response_model=List[MealResponse])
async def get_meals(
    skip: int = 0,
    limit: int = 100,
    meal_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id()
    query = db.query(Meal).filter(Meal.user_id == user_id)

    if meal_type:
        query = query.filter(Meal.meal_type == meal_type)
    if start_date:
        query = query.filter(Meal.date >= start_date)

    meals = query.order_by(Meal.date.desc()).offset(skip).limit(limit).all()
    return meals


@router.get("/meals/{meal_id}", response_model=MealResponse)
async def get_meal(meal_id: int, db: Session = Depends(get_db)):
    user_id = get_current_user_id()
    meal = db.query(Meal).filter(Meal.id == meal_id, Meal.user_id == user_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    return meal


@router.delete("/meals/{meal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_meal(meal_id: int, db: Session = Depends(get_db)):
    user_id = get_current_user_id()
    meal = db.query(Meal).filter(Meal.id == meal_id, Meal.user_id == user_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    db.delete(meal)
    db.commit()
    return None


# ============== FRUIT LOGS ==============
@router.post("/fruits", response_model=FruitLogResponse, status_code=status.HTTP_201_CREATED)
async def create_fruit_log(fruit: FruitLogCreate, db: Session = Depends(get_db)):
    user_id = get_current_user_id()
    db_fruit = FruitLog(**fruit.model_dump(), user_id=user_id)
    db.add(db_fruit)
    db.commit()
    db.refresh(db_fruit)
    return db_fruit


@router.get("/fruits", response_model=List[FruitLogResponse])
async def get_fruit_logs(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id()
    query = db.query(FruitLog).filter(FruitLog.user_id == user_id)

    if start_date:
        query = query.filter(FruitLog.consumption_date >= start_date)

    fruits = query.order_by(FruitLog.consumption_date.desc()).offset(skip).limit(limit).all()
    return fruits


@router.get("/fruits/{fruit_id}", response_model=FruitLogResponse)
async def get_fruit_log(fruit_id: int, db: Session = Depends(get_db)):
    user_id = get_current_user_id()
    fruit = db.query(FruitLog).filter(FruitLog.id == fruit_id, FruitLog.user_id == user_id).first()
    if not fruit:
        raise HTTPException(status_code=404, detail="Fruit log not found")
    return fruit


# ============== WORKOUT SESSIONS ==============
@router.post("/workouts", response_model=WorkoutSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_workout_session(workout: WorkoutSessionCreate, db: Session = Depends(get_db)):
    user_id = get_current_user_id()
    db_workout = WorkoutSession(**workout.model_dump(), user_id=user_id)
    db.add(db_workout)
    db.commit()
    db.refresh(db_workout)

    # Update fitness progress
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    progress = db.query(FitnessProgress).filter(
        FitnessProgress.user_id == user_id,
        FitnessProgress.date == today
    ).first()

    if progress:
        progress.workouts_completed += 1
        progress.total_calories_burned += workout.calories_burned
        progress.total_workout_minutes += workout.duration_minutes
    else:
        progress = FitnessProgress(
            user_id=user_id,
            date=today,
            workouts_completed=1,
            total_calories_burned=workout.calories_burned,
            total_workout_minutes=workout.duration_minutes
        )
        db.add(progress)
        db.commit()

    return db_workout


@router.get("/workouts", response_model=List[WorkoutSessionResponse])
async def get_workout_sessions(
    skip: int = 0,
    limit: int = 100,
    workout_type: Optional[str] = None,
    program_name: Optional[str] = None,
    start_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id()
    query = db.query(WorkoutSession).filter(WorkoutSession.user_id == user_id)

    if workout_type:
        query = query.filter(WorkoutSession.workout_type == workout_type)
    if program_name:
        query = query.filter(WorkoutSession.program_name == program_name)
    if start_date:
        query = query.filter(WorkoutSession.date >= start_date)

    workouts = query.order_by(WorkoutSession.date.desc()).offset(skip).limit(limit).all()
    return workouts


@router.get("/workouts/{workout_id}", response_model=WorkoutSessionResponse)
async def get_workout_session(workout_id: int, db: Session = Depends(get_db)):
    user_id = get_current_user_id()
    workout = db.query(WorkoutSession).filter(
        WorkoutSession.id == workout_id,
        WorkoutSession.user_id == user_id
    ).first()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout session not found")
    return workout


# ============== WORKOUT PROGRAMS ==============
@router.post("/programs", response_model=WorkoutProgramResponse, status_code=status.HTTP_201_CREATED)
async def create_workout_program(program: WorkoutProgramCreate, db: Session = Depends(get_db)):
    user_id = get_current_user_id()
    db_program = WorkoutProgram(**program.model_dump(), user_id=user_id)
    db.add(db_program)
    db.commit()
    db.refresh(db_program)
    return db_program


@router.get("/programs", response_model=List[WorkoutProgramResponse])
async def get_workout_programs(
    skip: int = 0,
    limit: int = 100,
    program_type: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id()
    query = db.query(WorkoutProgram).filter(WorkoutProgram.user_id == user_id)

    if program_type:
        query = query.filter(WorkoutProgram.program_type == program_type)
    if is_active is not None:
        query = query.filter(WorkoutProgram.is_active == is_active)

    programs = query.order_by(WorkoutProgram.created_at.desc()).offset(skip).limit(limit).all()
    return programs


@router.put("/programs/{program_id}", response_model=WorkoutProgramResponse)
async def update_workout_program(
    program_id: int,
    program_update: dict,
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id()
    program = db.query(WorkoutProgram).filter(
        WorkoutProgram.id == program_id,
        WorkoutProgram.user_id == user_id
    ).first()

    if not program:
        raise HTTPException(status_code=404, detail="Workout program not found")

    for key, value in program_update.items():
        setattr(program, key, value)

    db.commit()
    db.refresh(program)
    return program


# ============== NUTRITION GOALS ==============
@router.get("/nutrition-goals/today", response_model=NutritionGoalResponse)
async def get_today_nutrition_goal(db: Session = Depends(get_db)):
    user_id = get_current_user_id()
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

    goal = db.query(NutritionGoal).filter(
        NutritionGoal.user_id == user_id,
        NutritionGoal.date == today
    ).first()

    if not goal:
        # Create default goal for today
        goal = NutritionGoal(
            user_id=user_id,
            date=today,
            calorie_goal=2000,
            protein_goal=150,
            carbs_goal=200,
            fat_goal=70,
            fiber_goal=30,
            water_goal_ml=2000
        )
        db.add(goal)
        db.commit()
        db.refresh(goal)

    return goal


@router.put("/nutrition-goals/today", response_model=NutritionGoalResponse)
async def update_today_nutrition_goal(
    goal_update: dict,
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id()
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

    goal = db.query(NutritionGoal).filter(
        NutritionGoal.user_id == user_id,
        NutritionGoal.date == today
    ).first()

    if not goal:
        goal = NutritionGoal(user_id=user_id, date=today)
        db.add(goal)

    for key, value in goal_update.items():
        setattr(goal, key, value)

    db.commit()
    db.refresh(goal)
    return goal


@router.get("/nutrition-goals/history", response_model=List[NutritionGoalResponse])
async def get_nutrition_goal_history(
    days: int = 30,
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id()
    start_date = datetime.now() - timedelta(days=days)

    goals = db.query(NutritionGoal).filter(
        NutritionGoal.user_id == user_id,
        NutritionGoal.date >= start_date
    ).order_by(NutritionGoal.date.desc()).all()

    return goals


# ============== FITNESS PROGRESS ==============
@router.get("/fitness-progress/today", response_model=FitnessProgressResponse)
async def get_today_fitness_progress(db: Session = Depends(get_db)):
    user_id = get_current_user_id()
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

    progress = db.query(FitnessProgress).filter(
        FitnessProgress.user_id == user_id,
        FitnessProgress.date == today
    ).first()

    if not progress:
        # Create default progress for today
        progress = FitnessProgress(user_id=user_id, date=today)
        db.add(progress)
        db.commit()
        db.refresh(progress)

    return progress


@router.get("/fitness-progress/history", response_model=List[FitnessProgressResponse])
async def get_fitness_progress_history(
    days: int = 30,
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id()
    start_date = datetime.now() - timedelta(days=days)

    progress_list = db.query(FitnessProgress).filter(
        FitnessProgress.user_id == user_id,
        FitnessProgress.date >= start_date
    ).order_by(FitnessProgress.date.desc()).all()

    return progress_list


@router.post("/fitness-progress", response_model=FitnessProgressResponse, status_code=status.HTTP_201_CREATED)
async def create_fitness_progress(
    progress_data: FitnessProgressCreate,
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id()
    progress = FitnessProgress(**progress_data.model_dump(), user_id=user_id)
    db.add(progress)
    db.commit()
    db.refresh(progress)
    return progress


# ============== DASHBOARD SUMMARY ==============
@router.get("/dashboard/summary")
async def get_health_dashboard_summary(db: Session = Depends(get_db)):
    """Get summary data for health dashboard."""
    user_id = get_current_user_id()
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = today - timedelta(days=7)

    # Today's nutrition
    today_nutrition = db.query(NutritionGoal).filter(
        NutritionGoal.user_id == user_id,
        NutritionGoal.date == today
    ).first()

    # Today's fitness
    today_fitness = db.query(FitnessProgress).filter(
        FitnessProgress.user_id == user_id,
        FitnessProgress.date == today
    ).first()

    # Week's meals
    week_meals = db.query(Meal).filter(
        Meal.user_id == user_id,
        Meal.date >= week_ago
    ).count()

    # Week's workouts
    week_workouts = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == user_id,
        WorkoutSession.date >= week_ago
    ).count()

    # Week's calories burned
    week_calories_burned = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == user_id,
        WorkoutSession.date >= week_ago
    ).all()
    total_calories_burned = sum(w.calories_burned for w in week_calories_burned)

    return {
        "today_nutrition": today_nutrition if today_nutrition else {},
        "today_fitness": today_fitness if today_fitness else {},
        "week_meals": week_meals,
        "week_workouts": week_workouts,
        "week_calories_burned": total_calories_burned
    }
