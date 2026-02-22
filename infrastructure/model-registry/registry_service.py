"""
Model Version Registry Service
FastAPI service for managing model versions
"""
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, desc
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
import os
import hashlib
from pathlib import Path

from database import get_db, init_db, close_db
from models import (
    Model, ModelVersion, ModelMetrics, ModelDeployment, ModelComparison,
    ModelType, ModelFormat, ModelStatus
)
from pydantic import BaseModel, Field

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="PhotoIdentifier Model Version Registry",
    description="Service for managing AI model versions",
    version="1.0.0"
)

# Model storage directory
MODEL_STORAGE_DIR = "/models/storage"
os.makedirs(MODEL_STORAGE_DIR, exist_ok=True)


# Pydantic models for request/response
class ModelCreate(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    model_type: ModelType


class ModelVersionCreate(BaseModel):
    model_name: str = Field(..., max_length=100)
    version: str = Field(..., max_length=50)
    format: ModelFormat
    trained_by: Optional[str] = None
    training_dataset: Optional[str] = None
    training_config: Optional[Dict[str, Any]] = None
    accuracy: Optional[float] = Field(None, ge=0.0, le=1.0)
    precision: Optional[float] = Field(None, ge=0.0, le=1.0)
    recall: Optional[float] = Field(None, ge=0.0, le=1.0)
    f1_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    mAP: Optional[float] = Field(None, ge=0.0, le=1.0)
    input_shape: Optional[List[int]] = None
    output_shape: Optional[List[int]] = None
    release_notes: Optional[str] = None


class ModelVersionDeploy(BaseModel):
    model_name: str = Field(..., max_length=100)
    version: str = Field(..., max_length=50)
    deployment_target: str = Field(..., max_length=200)
    deployed_by: Optional[str] = None


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    await init_db()
    logger.info("Model registry service initialized")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    await close_db()


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.get("/models")
async def list_models(
    model_type: Optional[ModelType] = None,
    is_active: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    """List all models"""
    query = select(Model)

    if model_type:
        query = query.where(Model.model_type == model_type)
    if is_active is not None:
        query = query.where(Model.is_active == is_active)

    result = await db.execute(query)
    models = result.scalars().all()

    return {
        "models": [
            {
                "id": model.id,
                "name": model.name,
                "description": model.description,
                "type": model.model_type.value,
                "created_at": model.created_at.isoformat(),
                "updated_at": model.updated_at.isoformat(),
                "is_active": model.is_active,
                "version_count": len(model.versions)
            }
            for model in models
        ]
    }


@app.get("/models/{model_name}")
async def get_model(
    model_name: str,
    db: AsyncSession = Depends(get_db)
):
    """Get model details"""
    query = select(Model).where(Model.name == model_name)
    result = await db.execute(query)
    model = result.scalar_one_or_none()

    if not model:
        raise HTTPException(status_code=404, detail=f"Model {model_name} not found")

    return {
        "id": model.id,
        "name": model.name,
        "description": model.description,
        "type": model.model_type.value,
        "created_at": model.created_at.isoformat(),
        "updated_at": model.updated_at.isoformat(),
        "is_active": model.is_active,
        "versions": [
            {
                "version": v.version,
                "format": v.format.value,
                "status": v.status.value,
                "created_at": v.created_at.isoformat(),
                "is_default": v.is_default
            }
            for v in model.versions
        ]
    }


@app.post("/models")
async def create_model(
    model_data: ModelCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new model"""
    # Check if model already exists
    query = select(Model).where(Model.name == model_data.name)
    result = await db.execute(query)
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(status_code=400, detail=f"Model {model_data.name} already exists")

    # Create model
    model = Model(
        name=model_data.name,
        description=model_data.description,
        model_type=model_data.model_type
    )
    db.add(model)
    await db.commit()
    await db.refresh(model)

    logger.info(f"Created model: {model_data.name}")

    return {
        "id": model.id,
        "name": model.name,
        "description": model.description,
        "type": model.model_type.value,
        "created_at": model.created_at.isoformat()
    }


@app.get("/models/{model_name}/versions")
async def list_model_versions(
    model_name: str,
    status: Optional[ModelStatus] = None,
    is_default: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    """List all versions of a model"""
    # Get model
    model_query = select(Model).where(Model.name == model_name)
    model_result = await db.execute(model_query)
    model = model_result.scalar_one_or_none()

    if not model:
        raise HTTPException(status_code=404, detail=f"Model {model_name} not found")

    # Get versions
    query = select(ModelVersion).where(ModelVersion.model_id == model.id)

    if status:
        query = query.where(ModelVersion.status == status)
    if is_default is not None:
        query = query.where(ModelVersion.is_default == is_default)

    query = query.order_by(desc(ModelVersion.created_at))
    result = await db.execute(query)
    versions = result.scalars().all()

    return {
        "model_name": model_name,
        "versions": [
            {
                "id": v.id,
                "version": v.version,
                "format": v.format.value,
                "status": v.status.value,
                "created_at": v.created_at.isoformat(),
                "deployed_at": v.deployed_at.isoformat() if v.deployed_at else None,
                "accuracy": v.accuracy,
                "is_default": v.is_default,
                "trained_by": v.trained_by
            }
            for v in versions
        ]
    }


@app.get("/models/{model_name}/versions/{version}")
async def get_model_version(
    model_name: str,
    version: str,
    db: AsyncSession = Depends(get_db)
):
    """Get specific model version details"""
    # Get model
    model_query = select(Model).where(Model.name == model_name)
    model_result = await db.execute(model_query)
    model = model_result.scalar_one_or_none()

    if not model:
        raise HTTPException(status_code=404, detail=f"Model {model_name} not found")

    # Get version
    query = select(ModelVersion).where(
        and_(
            ModelVersion.model_id == model.id,
            ModelVersion.version == version
        )
    )
    result = await db.execute(query)
    version_obj = result.scalar_one_or_none()

    if not version_obj:
        raise HTTPException(
            status_code=404,
            detail=f"Version {version} of model {model_name} not found"
        )

    return {
        "id": version_obj.id,
        "model_name": model_name,
        "version": version_obj.version,
        "format": version_obj.format.value,
        "status": version_obj.status.value,
        "created_at": version_obj.created_at.isoformat(),
        "deployed_at": version_obj.deployed_at.isoformat() if version_obj.deployed_at else None,
        "file_path": version_obj.file_path,
        "file_size": version_obj.file_size,
        "checksum": version_obj.checksum,
        "trained_by": version_obj.trained_by,
        "training_dataset": version_obj.training_dataset,
        "training_config": version_obj.training_config,
        "accuracy": version_obj.accuracy,
        "precision": version_obj.precision,
        "recall": version_obj.recall,
        "f1_score": version_obj.f1_score,
        "mAP": version_obj.mAP,
        "input_shape": version_obj.input_shape,
        "output_shape": version_obj.output_shape,
        "deployed_to": version_obj.deployed_to,
        "is_default": version_obj.is_default,
        "release_notes": version_obj.release_notes
    }


@app.post("/models/{model_name}/versions")
async def create_model_version(
    model_name: str,
    version_data: ModelVersionCreate,
    file: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    """Create a new model version"""
    # Get model
    model_query = select(Model).where(Model.name == version_data.model_name)
    model_result = await db.execute(model_query)
    model = model_result.scalar_one_or_none()

    if not model:
        raise HTTPException(status_code=404, detail=f"Model {version_data.model_name} not found")

    # Check if version already exists
    version_query = select(ModelVersion).where(
        and_(
            ModelVersion.model_id == model.id,
            ModelVersion.version == version_data.version
        )
    )
    version_result = await db.execute(version_query)
    existing = version_result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Version {version_data.version} already exists"
        )

    # Process file upload
    file_path = None
    file_size = None
    checksum = None

    if file:
        # Save file
        file_dir = os.path.join(MODEL_STORAGE_DIR, version_data.model_name)
        os.makedirs(file_dir, exist_ok=True)

        file_path = os.path.join(file_dir, f"{version_data.version}.onnx")
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
            file_size = len(content)

        # Calculate checksum
        sha256 = hashlib.sha256()
        sha256.update(content)
        checksum = sha256.hexdigest()

    # Create version
    version = ModelVersion(
        model_id=model.id,
        version=version_data.version,
        format=version_data.format,
        trained_by=version_data.trained_by,
        training_dataset=version_data.training_dataset,
        training_config=version_data.training_config,
        accuracy=version_data.accuracy,
        precision=version_data.precision,
        recall=version_data.recall,
        f1_score=version_data.f1_score,
        mAP=version_data.mAP,
        input_shape=version_data.input_shape,
        output_shape=version_data.output_shape,
        release_notes=version_data.release_notes,
        file_path=file_path,
        file_size=file_size,
        checksum=checksum
    )
    db.add(version)
    await db.commit()
    await db.refresh(version)

    logger.info(f"Created version {version_data.version} for model {version_data.model_name}")

    return {
        "id": version.id,
        "model_name": version_data.model_name,
        "version": version.version,
        "format": version.format.value,
        "status": version.status.value,
        "created_at": version.created_at.isoformat(),
        "file_path": version.file_path,
        "file_size": version.file_size
    }


@app.post("/deploy")
async def deploy_model_version(
    deployment: ModelVersionDeploy,
    db: AsyncSession = Depends(get_db)
):
    """Deploy a model version"""
    # Get model
    model_query = select(Model).where(Model.name == deployment.model_name)
    model_result = await db.execute(model_query)
    model = model_result.scalar_one_or_none()

    if not model:
        raise HTTPException(status_code=404, detail=f"Model {deployment.model_name} not found")

    # Get version
    version_query = select(ModelVersion).where(
        and_(
            ModelVersion.model_id == model.id,
            ModelVersion.version == deployment.version
        )
    )
    version_result = await db.execute(version_query)
    version = version_result.scalar_one_or_none()

    if not version:
        raise HTTPException(
            status_code=404,
            detail=f"Version {deployment.version} not found"
        )

    # Update version
    version.deployed_at = datetime.utcnow()
    version.deployed_to = deployment.deployment_target
    version.status = ModelStatus.APPROVED

    # Set as default if not already
    if not version.is_default:
        # Clear default flag for other versions
        await db.execute(
            select(ModelVersion).where(
                and_(
                    ModelVersion.model_id == model.id,
                    ModelVersion.is_default == True
                )
            )
        )
        version.is_default = True

    # Create deployment record
    deployment_record = ModelDeployment(
        model_version_id=version.id,
        deployment_target=deployment.deployment_target,
        deployed_by=deployment.deployed_by,
        deployment_status="success"
    )
    db.add(deployment_record)

    await db.commit()

    logger.info(
        f"Deployed version {deployment.version} of model {deployment.model_name} "
        f"to {deployment.deployment_target}"
    )

    return {
        "status": "success",
        "model_name": deployment.model_name,
        "version": deployment.version,
        "deployment_target": deployment.deployment_target,
        "deployed_at": version.deployed_at.isoformat()
    }


@app.get("/models/{model_name}/versions/default")
async def get_default_version(
    model_name: str,
    db: AsyncSession = Depends(get_db)
):
    """Get the default version of a model"""
    # Get model
    model_query = select(Model).where(Model.name == model_name)
    model_result = await db.execute(model_query)
    model = model_result.scalar_one_or_none()

    if not model:
        raise HTTPException(status_code=404, detail=f"Model {model_name} not found")

    # Get default version
    query = select(ModelVersion).where(
        and_(
            ModelVersion.model_id == model.id,
            ModelVersion.is_default == True
        )
    )
    result = await db.execute(query)
    version = result.scalar_one_or_none()

    if not version:
        raise HTTPException(
            status_code=404,
            detail=f"No default version set for model {model_name}"
        )

    return {
        "model_name": model_name,
        "version": version.version,
        "format": version.format.value,
        "status": version.status.value,
        "deployed_at": version.deployed_at.isoformat() if version.deployed_at else None,
        "deployed_to": version.deployed_to
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("registry_service:app", host="0.0.0.0", port=8003, workers=2)
