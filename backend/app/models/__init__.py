# Database models
from app.models.core import User, Photo, PhotoIdentification, Collection, CollectionPhoto
from app.models.nature import (
    PlantIdentification,
    MushroomIdentification,
    BirdIdentification,
    InsectIdentification
)

__all__ = [
    "User",
    "Photo",
    "PhotoIdentification",
    "Collection",
    "CollectionPhoto",
    "PlantIdentification",
    "MushroomIdentification",
    "BirdIdentification",
    "InsectIdentification",
]
