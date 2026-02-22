"""
Database models for Model Version Registry
"""
from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Text, JSON, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()


class ModelType(enum.Enum):
    """Model type enumeration"""
    CLASSIFICATION = "classification"
    OBJECT_DETECTION = "object_detection"
    FACE_RECOGNITION = "face_recognition"
    SEGMENTATION = "segmentation"
    AUDIO = "audio"


class ModelFormat(enum.Enum):
    """Model format enumeration"""
    TENSORFLOW_SAVED_MODEL = "tensorflow_saved_model"
    ONNX = "onnx"
    TFLITE = "tflite"
    PYTORCH = "pytorch"


class ModelStatus(enum.Enum):
    """Model status enumeration"""
    TRAINING = "training"
    TESTING = "testing"
    APPROVED = "approved"
    DEPRECATED = "deprecated"
    ARCHIVED = "archived"


class Model(Base):
    """Model metadata"""
    __tablename__ = "models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text)
    model_type = Column(Enum(ModelType), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # Relationships
    versions = relationship("ModelVersion", back_populates="model", cascade="all, delete-orphan")


class ModelVersion(Base):
    """Model version information"""
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("models.id"), nullable=False, index=True)
    version = Column(String(50), nullable=False, index=True)
    format = Column(Enum(ModelFormat), nullable=False)
    status = Column(Enum(ModelStatus), default=ModelStatus.TESTING, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    deployed_at = Column(DateTime)

    # Model metadata
    file_path = Column(String(500))
    file_size = Column(Integer)  # bytes
    checksum = Column(String(64))  # SHA-256

    # Training metadata
    trained_by = Column(String(100))
    training_dataset = Column(String(200))
    training_config = Column(JSON)

    # Performance metrics
    accuracy = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    f1_score = Column(Float)
    mAP = Column(Float)  # mean Average Precision for object detection

    # Model architecture
    input_shape = Column(JSON)  # e.g., [1, 3, 224, 224]
    output_shape = Column(JSON)  # e.g., [1, 1000]

    # Deployment info
    deployed_to = Column(String(200))  # e.g., "tensorflow-serving", "onnx-runtime"
    deployment_config = Column(JSON)

    # Notes
    release_notes = Column(Text)
    is_default = Column(Boolean, default=False, index=True)

    # Relationships
    model = relationship("Model", back_populates="versions")


class ModelMetrics(Base):
    """Detailed model metrics"""
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, index=True)
    model_version_id = Column(Integer, ForeignKey("model_versions.id"), nullable=False, index=True)
    metric_name = Column(String(100), nullable=False, index=True)
    metric_value = Column(Float, nullable=False)
    metric_type = Column(String(50))  # accuracy, latency, throughput, etc.
    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    metadata = Column(JSON)


class ModelDeployment(Base):
    """Model deployment tracking"""
    __tablename__ = "model_deployments"

    id = Column(Integer, primary_key=True, index=True)
    model_version_id = Column(Integer, ForeignKey("model_versions.id"), nullable=False, index=True)
    deployment_target = Column(String(200), nullable=False)  # e.g., "production", "staging"
    deployed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    deployed_by = Column(String(100))
    deployment_status = Column(String(50))  # success, failed, rollback
    rollback_at = Column(DateTime)
    rollback_reason = Column(Text)


class ModelComparison(Base):
    """Model version comparison results"""
    __tablename__ = "model_comparisons"

    id = Column(Integer, primary_key=True, index=True)
    model_version_a_id = Column(Integer, ForeignKey("model_versions.id"), nullable=False, index=True)
    model_version_b_id = Column(Integer, ForeignKey("model_versions.id"), nullable=False, index=True)
    comparison_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    dataset_name = Column(String(200))
    results = Column(JSON)  # Comparison metrics
    winner = Column(String(50))  # "A", "B", or "tie"
