"""
Collectibles apps models for identifying coins, vinyl records, trading cards, and banknotes.
Each app specializes in different collectible categories with detailed attributes.
"""
from sqlalchemy import (
    Column, String, Integer, Text, DateTime, ForeignKey, JSON, DECIMAL,
    CheckConstraint, Index, func, Boolean
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database.config import Base


class CoinIdentification(Base):
    """Coin identification results with numismatic data"""
    __tablename__ = "coin_identifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    photo_id = Column(UUID(as_uuid=True), ForeignKey("photos.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Basic identification
    denomination = Column(String(100))  # e.g., "1 dollar", "5 cent"
    currency = Column(String(50))  # e.g., "USD", "EUR", "GBP"
    country = Column(String(100))
    year = Column(Integer)

    # Identification details
    confidence = Column(DECIMAL(3, 2), nullable=False, CheckConstraint("confidence >= 0 AND confidence <= 1"))
    model_version = Column(String(50))

    # Coin specifications
    material = Column(String(100))  # gold, silver, copper, nickel, etc.
    composition = Column(String(255))  # e.g., "90% silver, 10% copper"
    weight = Column(DECIMAL(8, 3))  # in grams
    diameter = Column(DECIMAL(6, 2))  # in millimeters
    thickness = Column(DECIMAL(6, 2))  # in millimeters

    # Design details
    obverse_description = Column(Text)  # front of coin
    reverse_description = Column(Text)  # back of coin
    mint_mark = Column(String(10))  # e.g., "P", "D", "S", "W"
    mint_location = Column(String(100))

    # Value information
    face_value = Column(String(50))  # e.g., "$1.00"
    numismatic_value = Column(JSONB, default=dict)  # {good: 10, fine: 25, uncirculated: 100}
    estimated_value_low = Column(DECIMAL(12, 2))  # low end market value
    estimated_value_high = Column(DECIMAL(12, 2))  # high end market value
    currency_value = Column(String(50))  # currency for value estimates

    # Additional metadata
    description = Column(Text)
    historical_context = Column(Text)
    rarity = Column(String(50))  # common, uncommon, rare, very_rare
    mint_errors = Column(ARRAY(String))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Indexes
    __table_args__ = (
        Index("idx_coin_denomination", "denomination"),
        Index("idx_coin_currency", "currency"),
        Index("idx_coin_country", "country"),
        Index("idx_coin_year", "year"),
    )

    def __repr__(self):
        return f"<CoinIdentification(id={self.id}, denomination={self.denomination}, currency={self.currency})>"


class VinylIdentification(Base):
    """Vinyl record identification results with discography data"""
    __tablename__ = "vinyl_identifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    photo_id = Column(UUID(as_uuid=True), ForeignKey("photos.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Basic identification
    album_title = Column(String(255))
    artist = Column(String(255))
    year_released = Column(Integer)

    # Identification details
    confidence = Column(DECIMAL(3, 2), nullable=False, CheckConstraint("confidence >= 0 AND confidence <= 1"))
    model_version = Column(String(50))

    # Record specifications
    format_type = Column(String(50))  # LP, EP, Single, 12", 10", 7"
    speed = Column(String(10))  # 33 1/3, 45, 78 RPM
    color = Column(String(50))  # black, colored, picture_disc
    label = Column(String(100))  # record label name
    catalog_number = Column(String(50))

    # Release details
    country_of_release = Column(String(100))
    pressing = Column(String(50))  # original, reissue, remastered
    edition = Column(String(100))  # first pressing, limited edition, etc.
    matrix_number = Column(String(100))  # etched in runout groove

    # Value information
    estimated_value_low = Column(DECIMAL(12, 2))
    estimated_value_high = Column(DECIMAL(12, 2))
    currency_value = Column(String(50))
    scarcity = Column(String(50))  # common, scarce, rare

    # Audio content
    track_listing = Column(JSONB, default=list)  # [{side: "A", tracks: ["Song1", "Song2"]}]
    genre = Column(String(100))
    duration = Column(String(20))  # total runtime

    # Additional metadata
    description = Column(Text)
    condition_guide = Column(Text)  # typical conditions for this release
    notable_features = Column(Text)  # gatefold, poster, special inserts

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Indexes
    __table_args__ = (
        Index("idx_vinyl_album_title", "album_title"),
        Index("idx_vinyl_artist", "artist"),
        Index("idx_vinyl_label", "label"),
        Index("idx_vinyl_year_released", "year_released"),
    )

    def __repr__(self):
        return f"<VinylIdentification(id={self.id}, album_title={self.album_title}, artist={self.artist})>"


class CardIdentification(Base):
    """Trading card identification results"""
    __tablename__ = "card_identifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    photo_id = Column(UUID(as_uuid=True), ForeignKey("photos.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Basic identification
    card_name = Column(String(255))
    card_number = Column(String(50))  # e.g., "1/102", "4/132"
    set_name = Column(String(255))  # e.g., "Base Set", "Jungle"
    series = Column(String(100))

    # Card type
    card_type = Column(String(100))  # e.g., "Pokémon", "Magic: The Gathering", "Sports", "Yu-Gi-Oh!"
    rarity = Column(String(50))  # common, uncommon, rare, ultra rare, secret rare
    holofoil = Column(Boolean, default=False)
    reverse_holo = Column(Boolean, default=False)
    special_edition = Column(Boolean, default=False)

    # Identification details
    confidence = Column(DECIMAL(3, 2), nullable=False, CheckConstraint("confidence >= 0 AND confidence <= 1"))
    model_version = Column(String(50))

    # Card attributes
    attributes = Column(JSONB, default=dict)  # varies by card type (type, element, stats, etc.)
    artist = Column(String(255))  # card illustrator
    year_released = Column(Integer)

    # Value information
    estimated_value_low = Column(DECIMAL(12, 2))
    estimated_value_high = Column(DECIMAL(12, 2))
    currency_value = Column(String(50))
    population = Column(JSONB, default=dict)  # population counts by grade
    graded_value = Column(JSONB, default=dict)  # values by grade (PSA 9, 10, etc.)

    # Sports cards specific
    player_name = Column(String(255))
    team = Column(String(100))
    sport = Column(String(50))
    position = Column(String(50))
    rookie_card = Column(Boolean, default=False)

    # Additional metadata
    description = Column(Text)
    notable_features = Column(Text)  # misprints, variations, etc.
    collection_series = Column(String(255))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Indexes
    __table_args__ = (
        Index("idx_card_name", "card_name"),
        Index("idx_card_set_name", "set_name"),
        Index("idx_card_type", "card_type"),
        Index("idx_card_rarity", "rarity"),
        Index("idx_card_player_name", "player_name"),
    )

    def __repr__(self):
        return f"<CardIdentification(id={self.id}, card_name={self.card_name}, set_name={self.set_name})>"


class BanknoteIdentification(Base):
    """Banknote identification results with numismatic data"""
    __tablename__ = "banknote_identifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    photo_id = Column(UUID(as_uuid=True), ForeignKey("photos.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Basic identification
    denomination = Column(String(100))  # e.g., "$100", "€50"
    currency = Column(String(50))  # e.g., "USD", "EUR", "JPY"
    country = Column(String(100))

    # Identification details
    confidence = Column(DECIMAL(3, 2), nullable=False, CheckConstraint("confidence >= 0 AND confidence <= 1"))
    model_version = Column(String(50))

    # Banknote specifications
    series = Column(String(100))  # series year or designation
    year_printed = Column(Integer)
    serial_number = Column(String(50))  # visible on the note
    seal_type = Column(String(50))  # blue seal, red seal, green seal, etc.
    signature_combo = Column(String(255))  # treasurer and secretary signatures

    # Design details
    portrait = Column(String(255))  # person depicted on front
    reverse_design = Column(Text)  # description of back design
    security_features = Column(JSONB, default=list)  # watermarks, security thread, color-shifting ink

    # Value information
    face_value = Column(String(50))
    numismatic_value = Column(JSONB, default=dict)  # {very_fine: 150, uncirculated: 300}
    estimated_value_low = Column(DECIMAL(12, 2))
    estimated_value_high = Column(DECIMAL(12, 2))
    currency_value = Column(String(50))

    # Additional metadata
    description = Column(Text)
    historical_context = Column(Text)
    star_note = Column(Boolean, default=False)  # special replacement note
    error_note = Column(Boolean, default=False)  # printing errors
    error_details = Column(Text)
    rarity = Column(String(50))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Indexes
    __table_args__ = (
        Index("idx_banknote_denomination", "denomination"),
        Index("idx_banknote_currency", "currency"),
        Index("idx_banknote_country", "country"),
        Index("idx_banknote_series", "series"),
    )

    def __repr__(self):
        return f"<BanknoteIdentification(id={self.id}, denomination={self.denomination}, currency={self.currency})>"
