"""Add database indexes for performance optimization

Revision ID: 001_add_performance_indexes
Revises:
Create Date: 2026-02-22

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_add_performance_indexes'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table indexes
    op.create_index('idx_users_email', 'users', ['email'], unique=True)
    op.create_index('idx_users_name', 'users', ['name'])
    op.create_index('idx_users_created_at', 'users', ['created_at'])

    # Photos table indexes
    op.create_index('idx_photos_user_id', 'photos', ['user_id'])
    op.create_index('idx_photos_status', 'photos', ['status'])
    op.create_index('idx_photos_created_at', 'photos', ['created_at'])
    op.create_index('idx_photos_tags', 'photos', ['tags'], postgresql_using='gin')
    op.create_index('idx_photos_format', 'photos', ['format'])

    # Photo identifications table indexes
    op.create_index('idx_photo_identifications_photo_id', 'photo_identifications', ['photo_id'])
    op.create_index('idx_photo_identifications_model', 'photo_identifications', ['model'])
    op.create_index('idx_photo_identifications_confidence', 'photo_identifications', ['confidence'])
    op.create_index('idx_photo_identifications_created_at', 'photo_identifications', ['created_at'])

    # Collections table indexes
    op.create_index('idx_collections_user_id', 'collections', ['user_id'])
    op.create_index('idx_collections_name', 'collections', ['name'])
    op.create_index('idx_collections_created_at', 'collections', ['created_at'])

    # Collection photos junction table indexes
    op.create_index('idx_collection_photos_collection_id', 'collection_photos', ['collection_id'])
    op.create_index('idx_collection_photos_photo_id', 'collection_photos', ['photo_id'])

    # Nature apps indexes - Plant
    op.create_index('idx_plant_scientific_name', 'plant_identifications', ['scientific_name'])
    op.create_index('idx_plant_common_name', 'plant_identifications', ['common_name'])
    op.create_index('idx_plant_family', 'plant_identifications', ['family'])
    op.create_index('idx_plant_genus', 'plant_identifications', ['genus'])

    # Nature apps indexes - Mushroom
    op.create_index('idx_mushroom_scientific_name', 'mushroom_identifications', ['scientific_name'])
    op.create_index('idx_mushroom_common_name', 'mushroom_identifications', ['common_name'])
    op.create_index('idx_mushroom_edibility', 'mushroom_identifications', ['edibility'])
    op.create_index('idx_mushroom_toxicity_level', 'mushroom_identifications', ['toxicity_level'])

    # Nature apps indexes - Bird
    op.create_index('idx_bird_scientific_name', 'bird_identifications', ['scientific_name'])
    op.create_index('idx_bird_common_name', 'bird_identifications', ['common_name'])
    op.create_index('idx_bird_family', 'bird_identifications', ['family'])
    op.create_index('idx_bird_conservation_status', 'bird_identifications', ['conservation_status'])

    # Nature apps indexes - Insect
    op.create_index('idx_insect_scientific_name', 'insect_identifications', ['scientific_name'])
    op.create_index('idx_insect_common_name', 'insect_identifications', ['common_name'])
    op.create_index('idx_insect_family', 'insect_identifications', ['family'])
    op.create_index('idx_insect_order', 'insect_identifications', ['order_insect'])

    # Collectibles apps indexes - Coin
    op.create_index('idx_coin_denomination', 'coin_identifications', ['denomination'])
    op.create_index('idx_coin_currency', 'coin_identifications', ['currency'])
    op.create_index('idx_coin_country', 'coin_identifications', ['country'])
    op.create_index('idx_coin_year', 'coin_identifications', ['year'])
    op.create_index('idx_coin_mint_mark', 'coin_identifications', ['mint_mark'])

    # Collectibles apps indexes - Vinyl
    op.create_index('idx_vinyl_album_title', 'vinyl_identifications', ['album_title'])
    op.create_index('idx_vinyl_artist', 'vinyl_identifications', ['artist'])
    op.create_index('idx_vinyl_label', 'vinyl_identifications', ['label'])
    op.create_index('idx_vinyl_year_released', 'vinyl_identifications', ['year_released'])
    op.create_index('idx_vinyl_catalog_number', 'vinyl_identifications', ['catalog_number'])

    # Collectibles apps indexes - Card
    op.create_index('idx_card_name', 'card_identifications', ['card_name'])
    op.create_index('idx_card_set_name', 'card_identifications', ['set_name'])
    op.create_index('idx_card_type', 'card_identifications', ['card_type'])
    op.create_index('idx_card_rarity', 'card_identifications', ['rarity'])
    op.create_index('idx_card_player_name', 'card_identifications', ['player_name'])

    # Collectibles apps indexes - Banknote
    op.create_index('idx_banknote_denomination', 'banknote_identifications', ['denomination'])
    op.create_index('idx_banknote_currency', 'banknote_identifications', ['currency'])
    op.create_index('idx_banknote_country', 'banknote_identifications', ['country'])
    op.create_index('idx_banknote_series', 'banknote_identifications', ['series'])
    op.create_index('idx_banknote_serial_number', 'banknote_identifications', ['serial_number'])

    # Health & Fitness apps indexes - Calo
    op.create_index('idx_calo_food_name', 'calo_identifications', ['food_name'])
    op.create_index('idx_calo_food_category', 'calo_identifications', ['food_category'])
    op.create_index('idx_calo_cuisine_type', 'calo_identifications', ['cuisine_type'])
    op.create_index('idx_calo_calories', 'calo_identifications', ['calories'])

    # Health & Fitness apps indexes - Fruit
    op.create_index('idx_fruit_fruit_name', 'fruit_identifications', ['fruit_name'])
    op.create_index('idx_fruit_scientific_name', 'fruit_identifications', ['scientific_name'])
    op.create_index('idx_fruit_fruit_type', 'fruit_identifications', ['fruit_type'])
    op.create_index('idx_fruit_variety', 'fruit_identifications', ['variety'])

    # Health & Fitness apps indexes - LazyFit
    op.create_index('idx_lazyfit_activity_name', 'lazyfit_identifications', ['activity_name'])
    op.create_index('idx_lazyfit_activity_type', 'lazyfit_identifications', ['activity_type'])
    op.create_index('idx_lazyfit_category', 'lazyfit_identifications', ['category'])
    op.create_index('idx_lazyfit_difficulty', 'lazyfit_identifications', ['difficulty'])

    # Health & Fitness apps indexes - MuscleFit
    op.create_index('idx_musclefit_exercise_name', 'musclefit_identifications', ['exercise_name'])
    op.create_index('idx_musclefit_muscle_name', 'musclefit_identifications', ['muscle_name'])
    op.create_index('idx_musclefit_exercise_category', 'musclefit_identifications', ['exercise_category'])
    op.create_index('idx_musclefit_primary_muscles', 'musclefit_identifications', ['primary_muscles'], postgresql_using='gin')

    # Pet & Vehicle apps indexes - Dog
    op.create_index('idx_dog_breed', 'dog_identifications', ['breed'])
    op.create_index('idx_dog_breed_group', 'dog_identifications', ['breed_group'])
    op.create_index('idx_dog_size', 'dog_identifications', ['size'])
    op.create_index('idx_dog_temperament', 'dog_identifications', ['temperament'], postgresql_using='gin')

    # Pet & Vehicle apps indexes - Cat
    op.create_index('idx_cat_breed', 'cat_identifications', ['breed'])
    op.create_index('idx_cat_breed_group', 'cat_identifications', ['breed_group'])
    op.create_index('idx_cat_size', 'cat_identifications', ['size'])
    op.create_index('idx_cat_temperament', 'cat_identifications', ['temperament'], postgresql_using='gin')

    # Pet & Vehicle apps indexes - Vehicle
    op.create_index('idx_vehicle_make', 'vehicle_identifications', ['make'])
    op.create_index('idx_vehicle_model', 'vehicle_identifications', ['model'])
    op.create_index('idx_vehicle_year', 'vehicle_identifications', ['year'])
    op.create_index('idx_vehicle_body_type', 'vehicle_identifications', ['body_type'])
    op.create_index('idx_vehicle_fuel_type', 'vehicle_identifications', ['fuel_type'])

    # Pet & Vehicle apps indexes - Fish
    op.create_index('idx_fish_common_name', 'fish_identifications', ['common_name'])
    op.create_index('idx_fish_scientific_name', 'fish_identifications', ['scientific_name'])
    op.create_index('idx_fish_fish_type', 'fish_identifications', ['fish_type'])
    op.create_index('idx_fish_family', 'fish_identifications', ['family'])
    op.create_index('idx_fish_habitat_type', 'fish_identifications', ['habitat_type'])


def downgrade() -> None:
    # Drop indexes in reverse order
    # Fish
    op.drop_index('idx_fish_habitat_type', table_name='fish_identifications')
    op.drop_index('idx_fish_family', table_name='fish_identifications')
    op.drop_index('idx_fish_fish_type', table_name='fish_identifications')
    op.drop_index('idx_fish_scientific_name', table_name='fish_identifications')
    op.drop_index('idx_fish_common_name', table_name='fish_identifications')

    # Vehicle
    op.drop_index('idx_vehicle_fuel_type', table_name='vehicle_identifications')
    op.drop_index('idx_vehicle_body_type', table_name='vehicle_identifications')
    op.drop_index('idx_vehicle_year', table_name='vehicle_identifications')
    op.drop_index('idx_vehicle_model', table_name='vehicle_identifications')
    op.drop_index('idx_vehicle_make', table_name='vehicle_identifications')

    # Cat
    op.drop_index('idx_cat_temperament', table_name='cat_identifications')
    op.drop_index('idx_cat_size', table_name='cat_identifications')
    op.drop_index('idx_cat_breed_group', table_name='cat_identifications')
    op.drop_index('idx_cat_breed', table_name='cat_identifications')

    # Dog
    op.drop_index('idx_dog_temperament', table_name='dog_identifications')
    op.drop_index('idx_dog_size', table_name='dog_identifications')
    op.drop_index('idx_dog_breed_group', table_name='dog_identifications')
    op.drop_index('idx_dog_breed', table_name='dog_identifications')

    # MuscleFit
    op.drop_index('idx_musclefit_primary_muscles', table_name='musclefit_identifications')
    op.drop_index('idx_musclefit_exercise_category', table_name='musclefit_identifications')
    op.drop_index('idx_musclefit_muscle_name', table_name='musclefit_identifications')
    op.drop_index('idx_musclefit_exercise_name', table_name='musclefit_identifications')

    # LazyFit
    op.drop_index('idx_lazyfit_difficulty', table_name='lazyfit_identifications')
    op.drop_index('idx_lazyfit_category', table_name='lazyfit_identifications')
    op.drop_index('idx_lazyfit_activity_type', table_name='lazyfit_identifications')
    op.drop_index('idx_lazyfit_activity_name', table_name='lazyfit_identifications')

    # Fruit
    op.drop_index('idx_fruit_variety', table_name='fruit_identifications')
    op.drop_index('idx_fruit_fruit_type', table_name='fruit_identifications')
    op.drop_index('idx_fruit_scientific_name', table_name='fruit_identifications')
    op.drop_index('idx_fruit_fruit_name', table_name='fruit_identifications')

    # Calo
    op.drop_index('idx_calo_calories', table_name='calo_identifications')
    op.drop_index('idx_calo_cuisine_type', table_name='calo_identifications')
    op.drop_index('idx_calo_food_category', table_name='calo_identifications')
    op.drop_index('idx_calo_food_name', table_name='calo_identifications')

    # Banknote
    op.drop_index('idx_banknote_serial_number', table_name='banknote_identifications')
    op.drop_index('idx_banknote_series', table_name='banknote_identifications')
    op.drop_index('idx_banknote_country', table_name='banknote_identifications')
    op.drop_index('idx_banknote_currency', table_name='banknote_identifications')
    op.drop_index('idx_banknote_denomination', table_name='banknote_identifications')

    # Card
    op.drop_index('idx_card_player_name', table_name='card_identifications')
    op.drop_index('idx_card_rarity', table_name='card_identifications')
    op.drop_index('idx_card_type', table_name='card_identifications')
    op.drop_index('idx_card_set_name', table_name='card_identifications')
    op.drop_index('idx_card_name', table_name='card_identifications')

    # Vinyl
    op.drop_index('idx_vinyl_catalog_number', table_name='vinyl_identifications')
    op.drop_index('idx_vinyl_year_released', table_name='vinyl_identifications')
    op.drop_index('idx_vinyl_label', table_name='vinyl_identifications')
    op.drop_index('idx_vinyl_artist', table_name='vinyl_identifications')
    op.drop_index('idx_vinyl_album_title', table_name='vinyl_identifications')

    # Coin
    op.drop_index('idx_coin_mint_mark', table_name='coin_identifications')
    op.drop_index('idx_coin_year', table_name='coin_identifications')
    op.drop_index('idx_coin_country', table_name='coin_identifications')
    op.drop_index('idx_coin_currency', table_name='coin_identifications')
    op.drop_index('idx_coin_denomination', table_name='coin_identifications')

    # Insect
    op.drop_index('idx_insect_order', table_name='insect_identifications')
    op.drop_index('idx_insect_family', table_name='insect_identifications')
    op.drop_index('idx_insect_common_name', table_name='insect_identifications')
    op.drop_index('idx_insect_scientific_name', table_name='insect_identifications')

    # Bird
    op.drop_index('idx_bird_conservation_status', table_name='bird_identifications')
    op.drop_index('idx_bird_family', table_name='bird_identifications')
    op.drop_index('idx_bird_common_name', table_name='bird_identifications')
    op.drop_index('idx_bird_scientific_name', table_name='bird_identifications')

    # Mushroom
    op.drop_index('idx_mushroom_toxicity_level', table_name='mushroom_identifications')
    op.drop_index('idx_mushroom_edibility', table_name='mushroom_identifications')
    op.drop_index('idx_mushroom_common_name', table_name='mushroom_identifications')
    op.drop_index('idx_mushroom_scientific_name', table_name='mushroom_identifications')

    # Plant
    op.drop_index('idx_plant_genus', table_name='plant_identifications')
    op.drop_index('idx_plant_family', table_name='plant_identifications')
    op.drop_index('idx_plant_common_name', table_name='plant_identifications')
    op.drop_index('idx_plant_scientific_name', table_name='plant_identifications')

    # Collection photos
    op.drop_index('idx_collection_photos_photo_id', table_name='collection_photos')
    op.drop_index('idx_collection_photos_collection_id', table_name='collection_photos')

    # Collections
    op.drop_index('idx_collections_created_at', table_name='collections')
    op.drop_index('idx_collections_name', table_name='collections')
    op.drop_index('idx_collections_user_id', table_name='collections')

    # Photo identifications
    op.drop_index('idx_photo_identifications_created_at', table_name='photo_identifications')
    op.drop_index('idx_photo_identifications_confidence', table_name='photo_identifications')
    op.drop_index('idx_photo_identifications_model', table_name='photo_identifications')
    op.drop_index('idx_photo_identifications_photo_id', table_name='photo_identifications')

    # Photos
    op.drop_index('idx_photos_format', table_name='photos')
    op.drop_index('idx_photos_tags', table_name='photos')
    op.drop_index('idx_photos_created_at', table_name='photos')
    op.drop_index('idx_photos_status', table_name='photos')
    op.drop_index('idx_photos_user_id', table_name='photos')

    # Users
    op.drop_index('idx_users_created_at', table_name='users')
    op.drop_index('idx_users_name', table_name='users')
    op.drop_index('idx_users_email', table_name='users')
