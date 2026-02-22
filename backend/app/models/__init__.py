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
from app.models.health_fitness import (
    CaloIdentification,
    FruitIdentification,
    LazyFitIdentification,
    MuscleFitIdentification
)
from app.models.pets_vehicles import (
    DogIdentification,
    CatIdentification,
    VehicleIdentification,
    FishIdentification
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
    "CaloIdentification",
    "FruitIdentification",
    "LazyFitIdentification",
    "MuscleFitIdentification",
    "DogIdentification",
    "CatIdentification",
    "VehicleIdentification",
    "FishIdentification",
]
