"""
Seed data script for the PhotoIdentifier platform.
Populates the database with sample users, photos, and identification records.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy.orm import Session
from app.database.config import SessionLocal, engine, Base
from app.models import (
    User, Photo, PhotoIdentification, Collection, CollectionPhoto,
    PlantIdentification, MushroomIdentification, BirdIdentification, InsectIdentification,
    CoinIdentification, VinylIdentification, CardIdentification, BanknoteIdentification,
    CaloIdentification, FruitIdentification, LazyFitIdentification, MuscleFitIdentification,
    DogIdentification, CatIdentification, VehicleIdentification, FishIdentification
)
from datetime import datetime
import json


def seed_users(db: Session):
    """Seed demo users"""
    users_data = [
        {
            "email": "demo@photoidentifier.com",
            "name": "Demo User",
            "preferences": {
                "theme": "auto",
                "language": "en",
                "notifications": {
                    "email": True,
                    "push": False,
                    "processingComplete": True,
                    "weeklySummary": False
                }
            }
        },
        {
            "email": "nature_lover@example.com",
            "name": "Nature Enthusiast",
            "preferences": {
                "theme": "dark",
                "language": "en",
                "notifications": {
                    "email": True,
                    "push": True,
                    "processingComplete": True,
                    "weeklySummary": True
                }
            }
        },
        {
            "email": "collector@example.com",
            "name": "Rare Collector",
            "preferences": {
                "theme": "light",
                "language": "en",
                "notifications": {
                    "email": False,
                    "push": True,
                    "processingComplete": False,
                    "weeklySummary": False
                }
            }
        }
    ]

    for user_data in users_data:
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()
        if not existing_user:
            user = User(**user_data)
            db.add(user)
            print(f"Created user: {user_data['name']}")

    db.commit()
    return users_data


def seed_photos_and_identifications(db: Session):
    """Seed sample photos and identification records"""
    users = db.query(User).all()
    if not users:
        print("No users found, skipping photos and identifications")
        return

    demo_user = users[0]

    # Create sample photos
    photos_data = [
        {
            "user_id": demo_user.id,
            "filename": "rose_flower.jpg",
            "original_url": "https://example.com/photos/rose.jpg",
            "thumbnail_url": "https://example.com/photos/rose_thumb.jpg",
            "size": 2450000,
            "width": 3024,
            "height": 4032,
            "format": "JPEG",
            "status": "completed",
            "tags": ["flower", "rose", "garden", "red"]
        },
        {
            "user_id": demo_user.id,
            "filename": "mushroom_forest.jpg",
            "original_url": "https://example.com/photos/mushroom.jpg",
            "thumbnail_url": "https://example.com/photos/mushroom_thumb.jpg",
            "size": 3100000,
            "width": 3024,
            "height": 4032,
            "format": "JPEG",
            "status": "completed",
            "tags": ["mushroom", "forest", "nature", "fungi"]
        },
        {
            "user_id": demo_user.id,
            "filename": "golden_retriever.jpg",
            "original_url": "https://example.com/photos/dog.jpg",
            "thumbnail_url": "https://example.com/photos/dog_thumb.jpg",
            "size": 2800000,
            "width": 3024,
            "height": 4032,
            "format": "JPEG",
            "status": "completed",
            "tags": ["dog", "golden_retriever", "pet", "cute"]
        },
        {
            "user_id": demo_user.id,
            "filename": "vintage_coin.jpg",
            "original_url": "https://example.com/photos/coin.jpg",
            "thumbnail_url": "https://example.com/photos/coin_thumb.jpg",
            "size": 1500000,
            "width": 2000,
            "height": 2000,
            "format": "JPEG",
            "status": "completed",
            "tags": ["coin", "vintage", "collectible", "silver"]
        },
        {
            "user_id": demo_user.id,
            "filename": "healthy_salad.jpg",
            "original_url": "https://example.com/photos/salad.jpg",
            "thumbnail_url": "https://example.com/photos/salad_thumb.jpg",
            "size": 2600000,
            "width": 3024,
            "height": 4032,
            "format": "JPEG",
            "status": "completed",
            "tags": ["food", "salad", "healthy", "vegetables"]
        }
    ]

    photos = []
    for photo_data in photos_data:
        existing_photo = db.query(Photo).filter(Photo.filename == photo_data["filename"]).first()
        if not existing_photo:
            photo = Photo(**photo_data)
            db.add(photo)
            db.flush()  # Get the photo ID
            photos.append(photo)
            print(f"Created photo: {photo_data['filename']}")
        else:
            photos.append(existing_photo)

    db.commit()

    # Seed plant identification
    if len(photos) > 0:
        existing = db.query(PlantIdentification).filter(PlantIdentification.photo_id == photos[0].id).first()
        if not existing:
            plant = PlantIdentification(
                photo_id=photos[0].id,
                scientific_name="Rosa rubiginosa",
                common_name="Sweet Briar Rose",
                family="Rosaceae",
                genus="Rosa",
                species="R. rubiginosa",
                confidence=0.95,
                model_version="v1.0",
                characteristics={"leaf_type": "pinnate", "flower_color": "pink", "height": "2-3m", "growth_habit": "shrub"},
                toxicity="non-toxic",
                edibility="inedible",
                description="A wild rose species native to Europe and western Asia",
                care_requirements={"sunlight": "full sun", "water": "moderate", "soil_type": "well-drained"},
                native_region="Europe, Western Asia",
                blooming_season="Late spring to early summer"
            )
            db.add(plant)
            print("Created plant identification")

    # Seed mushroom identification
    if len(photos) > 1:
        existing = db.query(MushroomIdentification).filter(MushroomIdentification.photo_id == photos[1].id).first()
        if not existing:
            mushroom = MushroomIdentification(
                photo_id=photos[1].id,
                scientific_name="Boletus edulis",
                common_name="Porcini",
                family="Boletaceae",
                genus="Boletus",
                order_mycology="Boletales",
                confidence=0.88,
                model_version="v1.0",
                characteristics={"cap_shape": "convex", "cap_color": "brown", "gill_type": "pores", "stem_features": "thick, bulbous"},
                edibility="edible",
                psychoactive=False,
                toxicity_level="non_toxic",
                look_alikes=["Tylopilus felleus"],
                description="One of the most highly regarded edible mushrooms",
                habitat="deciduous and coniferous forests",
                season="Autumn"
            )
            db.add(mushroom)
            print("Created mushroom identification")

    # Seed dog identification
    if len(photos) > 2:
        existing = db.query(DogIdentification).filter(DogIdentification.photo_id == photos[2].id).first()
        if not existing:
            dog = DogIdentification(
                photo_id=photos[2].id,
                breed="Golden Retriever",
                breed_group="Sporting",
                origin_country="Scotland",
                confidence=0.98,
                model_version="v1.0",
                size="large",
                weight_range="55-75 lbs",
                height_range="20-24 inches",
                coat_type="double, water-repellent",
                coat_colors=["golden", "cream"],
                shedding_level=4,
                hypoallergenic=False,
                temperament=["friendly", "intelligent", "devoted", "reliable"],
                energy_level="high",
                trainability="easy",
                barking_level="moderate",
                good_with_children=True,
                good_with_other_dogs=True,
                good_with_cats=True,
                life_expectancy="10-12 years",
                common_health_issues=["hip dysplasia", "elbow dysplasia", "eye conditions"],
                grooming_needs="moderate",
                exercise_needs="high",
                description="Intelligent, friendly, and devoted family dogs"
            )
            db.add(dog)
            print("Created dog identification")

    # Seed coin identification
    if len(photos) > 3:
        existing = db.query(CoinIdentification).filter(CoinIdentification.photo_id == photos[3].id).first()
        if not existing:
            coin = CoinIdentification(
                photo_id=photos[3].id,
                denomination="1 dollar",
                currency="USD",
                country="United States",
                year=1935,
                confidence=0.92,
                model_version="v1.0",
                material="silver",
                composition="90% silver, 10% copper",
                weight=26.73,
                diameter=38.1,
                thickness=3.1,
                obverse_description="Walking Liberty facing left",
                reverse_description="American eagle with spread wings",
                mint_mark="S",
                mint_location="San Francisco",
                face_value="$1.00",
                numismatic_value={"good": 20, "fine": 30, "uncirculated": 150},
                estimated_value_low=20.00,
                estimated_value_high=150.00,
                currency_value="USD",
                description="Walking Liberty half dollar, one of America's most beautiful coins",
                rarity="common"
            )
            db.add(coin)
            print("Created coin identification")

    # Seed food identification (Calo)
    if len(photos) > 4:
        existing = db.query(CaloIdentification).filter(CaloIdentification.photo_id == photos[4].id).first()
        if not existing:
            calo = CaloIdentification(
                photo_id=photos[4].id,
                food_name="Garden Fresh Salad",
                food_category="main_dish",
                cuisine_type="Mediterranean",
                confidence=0.85,
                model_version="v1.0",
                serving_size="1 bowl (350g)",
                serving_weight_grams=350,
                calories=220,
                protein=8.5,
                carbohydrates=18.0,
                fats=14.5,
                fiber=5.2,
                sugar=8.0,
                sodium=450,
                cholesterol=0,
                vitamins={"A": 80, "C": 120, "K": 200},
                minerals={"iron": 15, "calcium": 12, "potassium": 25},
                ingredients=["lettuce", "tomatoes", "cucumber", "olives", "feta cheese", "olive oil"],
                allergens=["dairy"],
                dietary_restrictions={"vegan": False, "vegetarian": True, "gluten_free": True},
                preparation_method="raw",
                description="Fresh Mediterranean-style salad with mixed vegetables"
            )
            db.add(calo)
            print("Created food identification")

    db.commit()


def seed_collections(db: Session):
    """Seed sample collections"""
    users = db.query(User).all()
    if not users:
        print("No users found, skipping collections")
        return

    demo_user = users[0]
    photos = db.query(Photo).all()
    if not photos:
        print("No photos found, skipping collections")
        return

    collections_data = [
        {
            "user_id": demo_user.id,
            "name": "My Nature Photos",
            "description": "Collection of plants, animals, and nature shots"
        },
        {
            "user_id": demo_user.id,
            "name": "Collectibles",
            "description": "Rare coins, cards, and other collectibles"
        },
        {
            "user_id": demo_user.id,
            "name": "Food & Nutrition",
            "description": "Healthy meals and nutritional information"
        }
    ]

    for collection_data in collections_data:
        existing = db.query(Collection).filter(
            Collection.user_id == collection_data["user_id"],
            Collection.name == collection_data["name"]
        ).first()

        if not existing:
            collection = Collection(**collection_data)
            db.add(collection)
            db.flush()  # Get the collection ID
            print(f"Created collection: {collection_data['name']}")

    db.commit()

    # Add photos to collections
    collections = db.query(Collection).all()
    if len(collections) > 0 and len(photos) > 0:
        # Add first 3 photos to Nature collection
        for i in range(min(3, len(photos))):
            existing = db.query(CollectionPhoto).filter(
                CollectionPhoto.collection_id == collections[0].id,
                CollectionPhoto.photo_id == photos[i].id
            ).first()

            if not existing:
                collection_photo = CollectionPhoto(
                    collection_id=collections[0].id,
                    photo_id=photos[i].id
                )
                db.add(collection_photo)

        # Add coin photo to Collectibles collection
        if len(photos) > 3:
            existing = db.query(CollectionPhoto).filter(
                CollectionPhoto.collection_id == collections[1].id,
                CollectionPhoto.photo_id == photos[3].id
            ).first()

            if not existing:
                collection_photo = CollectionPhoto(
                    collection_id=collections[1].id,
                    photo_id=photos[3].id
                )
                db.add(collection_photo)

        # Add food photo to Food collection
        if len(photos) > 4:
            existing = db.query(CollectionPhoto).filter(
                CollectionPhoto.collection_id == collections[2].id,
                CollectionPhoto.photo_id == photos[4].id
            ).first()

            if not existing:
                collection_photo = CollectionPhoto(
                    collection_id=collections[2].id,
                    photo_id=photos[4].id
                )
                db.add(collection_photo)

        db.commit()
        print("Added photos to collections")


def main():
    """Main seed function"""
    print("Starting database seed...")
    print("=" * 50)

    # Create all tables
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully")

    db = SessionLocal()

    try:
        # Seed data
        print("\nSeeding users...")
        seed_users(db)

        print("\nSeeding photos and identifications...")
        seed_photos_and_identifications(db)

        print("\nSeeding collections...")
        seed_collections(db)

        print("\n" + "=" * 50)
        print("Database seeding completed successfully!")

    except Exception as e:
        print(f"\nError during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
