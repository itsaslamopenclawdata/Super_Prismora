"""
Rock and Mineral identification models for RockPrismora app.
Specializes in geological identification with mineral properties and characteristics.
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


class RockIdentification(Base):
    """Rock identification results with geological data"""
    __tablename__ = "rock_identifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    photo_id = Column(UUID(as_uuid=True), ForeignKey("photos.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Basic identification
    rock_name = Column(String(255))
    rock_type = Column(String(100))  # igneous, sedimentary, metamorphic
    scientific_name = Column(String(255))
    variety = Column(String(255))

    # Identification details
    confidence = Column(DECIMAL(3, 2), nullable=False, check="confidence >= 0 AND confidence <= 1")
    model_version = Column(String(50))

    # Rock classification
    rock_class = Column(String(100))  # plutonic, volcanic, clastic, etc.
    formation_environment = Column(String(255))  # e.g., "volcanic", "marine", "river delta"

    # Physical properties
    hardness = Column(DECIMAL(4, 2))  # Mohs hardness scale (1-10)
    specific_gravity = Column(DECIMAL(5, 3))
    luster = Column(String(100))  # metallic, vitreous, dull, pearly, etc.
    color = Column(ARRAY(String))  # primary colors
    streak = Column(String(100))  # color of powder
    transparency = Column(String(50))  # transparent, translucent, opaque
    cleavage = Column(String(255))  # e.g., "perfect cubic", "none", "good basal"
    fracture = Column(String(255))  # e.g., "conchoidal", "uneven", "splintery"
    tenacity = Column(String(100))  # brittle, sectile, malleable, flexible

    # Chemical composition
    chemical_formula = Column(String(255))
    chemical_composition = Column(JSONB, default=dict)  # {SiO2: 60, Al2O3: 15, ...}
    mineral_content = Column(JSONB, default=dict)  # {quartz: 70, feldspar: 20, ...}

    # Texture and structure
    grain_size = Column(String(100))  # fine, medium, coarse
    texture = Column(String(100))  # crystalline, glassy, fragmental, banded
    structure = Column(String(255))  # e.g., "layered", "porous", "massive"

    # Occurrence
    occurrence = Column(Text)  # where and how it forms
    associated_rocks = Column(ARRAY(String))  # rocks found with it
    geographic_locations = Column(JSONB, default=list)  # notable locations

    # Uses and economic value
    uses = Column(ARRAY(String))  # construction, jewelry, industrial, etc.
    economic_value = Column(String(50))  # high, moderate, low, none
    industrial_applications = Column(Text)

    # Safety and handling
    radioactive = Column(Boolean, default=False)
    toxic = Column(Boolean, default=False)
    safety_notes = Column(Text)

    # Additional metadata
    description = Column(Text)
    historical_significance = Column(Text)
    similar_rocks = Column(ARRAY(String))  # look-alikes

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Indexes
    __table_args__ = (
        Index("idx_rock_name", "rock_name"),
        Index("idx_rock_type", "rock_type"),
        Index("idx_rock_class", "rock_class"),
        Index("idx_rock_hardness", "hardness"),
    )

    def __repr__(self):
        return f"<RockIdentification(id={self.id}, rock_name={self.rock_name}, rock_type={self.rock_type})>"


class MineralIdentification(Base):
    """Mineral identification results with detailed properties"""
    __tablename__ = "mineral_identifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    photo_id = Column(UUID(as_uuid=True), ForeignKey("photos.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Basic identification
    mineral_name = Column(String(255))
    mineral_group = Column(String(100))  # silicates, oxides, carbonates, sulfides, etc.
    scientific_name = Column(String(255))
    variety = Column(String(255))

    # Identification details
    confidence = Column(DECIMAL(3, 2), nullable=False, check="confidence >= 0 AND confidence <= 1")
    model_version = Column(String(50))

    # Crystal structure
    crystal_system = Column(String(100))  # cubic, hexagonal, tetragonal, etc.
    crystal_habit = Column(String(255))  # prismatic, tabular, botryoidal, etc.
    crystal_class = Column(String(100))  # e.g., "hexagonal scalenohedral"

    # Physical properties
    hardness = Column(DECIMAL(4, 2))  # Mohs hardness (1-10)
    specific_gravity = Column(DECIMAL(5, 3))
    luster = Column(String(100))
    color = Column(ARRAY(String))
    diaphaneity = Column(String(100))  # transparent, translucent, opaque
    streak = Column(String(100))
    cleavage = Column(JSONB, default=list)  # [{direction: "001", quality: "perfect"}, ...]
    fracture = Column(String(255))
    tenacity = Column(String(100))
    parting = Column(String(255))

    # Optical properties
    pleochroism = Column(Boolean, default=False)
    pleochroic_colors = Column(ARRAY(String))
    birefringence = Column(DECIMAL(6, 4))
    dispersion = Column(String(100))
    fluorescence = Column(Boolean, default=False)
    fluorescent_colors = Column(ARRAY(String))

    # Chemical properties
    chemical_formula = Column(String(255))
    chemical_composition = Column(JSONB, default=dict)
    chemical_group = Column(String(100))

    # Magnetic and electrical
    magnetic = Column(Boolean, default=False)
    magnetic_response = Column(String(100))  # ferromagnetic, paramagnetic, diamagnetic
    electrical_conductivity = Column(String(100))
    piezoelectric = Column(Boolean, default=False)
    pyroelectric = Column(Boolean, default=False)

    # Thermal properties
    fusibility = Column(String(100))  # fusibility scale (1-5)
    solubility = Column(String(255))

    # Occurrence and formation
    formation = Column(Text)  # how the mineral forms
    occurrence = Column(Text)  # where it's found
    associated_minerals = Column(ARRAY(String))
    geographic_locations = Column(JSONB, default=list)

    # Uses and value
    uses = Column(ARRAY(String))
    economic_importance = Column(String(50))  # critical, important, minor, none
    gemstone = Column(Boolean, default=False)
    gem_varieties = Column(ARRAY(String))

    # Safety
    radioactive = Column(Boolean, default=False)
    toxic = Column(Boolean, default=False)
    asbestos_form = Column(Boolean, default=False)
    safety_notes = Column(Text)

    # Additional metadata
    description = Column(Text)
    discovery_year = Column(Integer)
    named_after = Column(String(255))
    similar_minerals = Column(ARRAY(String))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Indexes
    __table_args__ = (
        Index("idx_mineral_name", "mineral_name"),
        Index("idx_mineral_group", "mineral_group"),
        Index("idx_mineral_system", "crystal_system"),
        Index("idx_mineral_hardness", "hardness"),
    )

    def __repr__(self):
        return f"<MineralIdentification(id={self.id}, mineral_name={self.mineral_name}, mineral_group={self.mineral_group})>"
