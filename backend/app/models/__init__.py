# Database models
from app.models.core import User, Photo, PhotoIdentification, Collection, CollectionPhoto
from app.models.nature import (
    PlantIdentification,
    MushroomIdentification,
    BirdIdentification,
    InsectIdentification
)
from app.models.collectibles import (
    CoinIdentification,
    VinylIdentification,
    CardIdentification,
    BanknoteIdentification
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
    "CoinIdentification",
    "VinylIdentification",
    "CardIdentification",
    "BanknoteIdentification",
]
