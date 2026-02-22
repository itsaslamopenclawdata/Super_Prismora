# PhotoIdentifier Backend

Python backend for the PhotoIdentifier platform using SQLAlchemy and Alembic for database management.

## Setup

### Prerequisites

- Python 3.9+
- PostgreSQL 16
- pip

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables (optional, defaults are provided):
```bash
export DATABASE_URL="postgresql://photoidentifier:photoidentifier_dev_password@localhost:5432/photoidentifier"
```

## Database Migrations

### Initial Setup

The database is set up with Alembic for version-controlled migrations.

### Creating a New Migration

To create a new migration after modifying models:

```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
```

### Running Migrations

To apply pending migrations:

```bash
cd backend
alembic upgrade head
```

To rollback to a previous version:

```bash
cd backend
alembic downgrade -1
```

To view migration history:

```bash
cd backend
alembic history
```

### Current Migration Status

To view the current migration version:

```bash
cd backend
alembic current
```

## Database Models

### Core Models

- **User**: Platform users with email, preferences
- **Photo**: Uploaded photos with metadata, tags, status
- **PhotoIdentification**: AI-powered identification results
- **Collection**: User collections for organizing photos
- **CollectionPhoto**: Junction table for many-to-many relationship

### App-Specific Models

#### Nature Apps
- **PlantIdentification**: Plant species with botanical data
- **MushroomIdentification**: Mushroom species with edibility tracking
- **BirdIdentification**: Bird species with ornithology data
- **InsectIdentification**: Insect species with entomology data

#### Collectibles Apps
- **CoinIdentification**: Coins with numismatic data and value estimation
- **VinylIdentification**: Vinyl records with discography information
- **CardIdentification**: Trading cards, sports cards, collectibles
- **BanknoteIdentification**: Currency with security features

#### Health & Fitness Apps
- **CaloIdentification**: Food identification with nutritional information
- **FruitIdentification**: Fruit species with botanical data
- **LazyFitIdentification**: Beginner-friendly exercise identification
- **MuscleFitIdentification**: Advanced muscle and exercise data

#### Pet & Vehicle Apps
- **DogIdentification**: Dog breeds with temperament and care info
- **CatIdentification**: Cat breeds with behavior data
- **VehicleIdentification**: Vehicles with make/model specs
- **FishIdentification**: Fish species with aquarium requirements

## Seed Data

To populate the database with sample data for testing:

```bash
cd backend
python scripts/seed_data.py
```

The seed script creates:
- Demo users with different preferences
- Sample photos across various categories
- Identification records for multiple apps
- Sample collections with photos

## Database Maintenance

The `db_maintenance.py` script provides utilities for database optimization:

### Available Commands

```bash
# Run VACUUM ANALYZE (reclaims storage and updates stats)
python scripts/db_maintenance.py vacuum

# Run ANALYZE (updates query planner statistics)
python scripts/db_maintenance.py analyze

# Rebuild all indexes (requires superuser)
python scripts/db_maintenance.py reindex

# View table sizes
python scripts/db_maintenance.py sizes

# View index usage statistics
python scripts/db_maintenance.py index-usage

# View slow query statistics (requires pg_stat_statements)
python scripts/db_maintenance.py slow-queries

# Check for table and index bloat
python scripts/db_maintenance.py bloat

# View connection statistics
python scripts/db_maintenance.py connections

# Run full maintenance routine
python scripts/db_maintenance.py full
```

### Full Maintenance

For comprehensive maintenance, run:

```bash
cd backend
python scripts/db_maintenance.py full
```

This performs:
1. Connection statistics check
2. Table size analysis
3. Bloat detection
4. Table analysis
5. VACUUM ANALYZE
6. Index usage analysis

## Database Connection

### Using in Code

```python
from app.database.config import SessionLocal, engine, Base

# Get a database session
db = SessionLocal()

try:
    # Use the session
    users = db.query(User).all()
finally:
    db.close()

# Create all tables (for development)
Base.metadata.create_all(bind=engine)

# Drop all tables (for testing)
Base.metadata.drop_all(bind=engine)
```

### Using Dependency Injection (FastAPI)

```python
from app.database.config import get_db

@app.get("/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()
```

## Performance Optimization

### Indexes

The database includes indexes on:
- Foreign key columns for join optimization
- Frequently queried columns (email, name, status, etc.)
- Date/time columns for time-based queries
- Array columns using GIN indexes
- JSONB columns for efficient JSON queries

### Query Tips

1. Use indexed columns in WHERE clauses
2. Limit result sets with LIMIT
3. Use JOINs instead of multiple queries
4. Select only needed columns
5. Use EXPLAIN ANALYZE to analyze slow queries

### Regular Maintenance

Run maintenance tasks regularly:
- Weekly: ANALYZE
- Monthly: VACUUM ANALYZE
- Quarterly: REINDEX (if needed)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://photoidentifier:photoidentifier_dev_password@localhost:5432/photoidentifier |

## Troubleshooting

### Migration Conflicts

If you encounter migration conflicts:

1. Check the current version: `alembic current`
2. Review migration history: `alembic history`
3. Manually edit the migration file if needed
4. Stamp the database to a specific version: `alembic stamp <revision>`

### Database Connection Issues

1. Verify PostgreSQL is running: `docker-compose ps postgres`
2. Check connection string in environment variables
3. Verify database exists: `\l` in psql
4. Check user permissions

### Performance Issues

1. Run maintenance: `python scripts/db_maintenance.py full`
2. Check index usage: `python scripts/db_maintenance.py index-usage`
3. Review slow queries: `python scripts/db_maintenance.py slow-queries`
4. Check for bloat: `python scripts/db_maintenance.py bloat`

## Development

### Adding a New Model

1. Create the model in `app/models/`:
```python
from sqlalchemy import Column, String
from app.database.config import Base

class MyModel(Base):
    __tablename__ = "my_table"
    id = Column(UUID(as_uuid=True), primary_key=True)
    name = Column(String(255))
```

2. Add indexes in the model:
```python
__table_args__ = (
    Index('idx_my_table_name', 'name'),
)
```

3. Create a migration:
```bash
alembic revision --autogenerate -m "Add MyModel"
```

4. Apply the migration:
```bash
alembic upgrade head
```

### Testing

Run seed data to populate the database for testing:
```bash
python scripts/seed_data.py
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── database/
│   │   ├── __init__.py
│   │   └── config.py          # Database configuration
│   └── models/
│       ├── __init__.py
│       ├── core.py           # Core platform models
│       ├── nature.py         # Nature apps models
│       ├── collectibles.py   # Collectibles apps models
│       ├── health_fitness.py # Health & fitness models
│       └── pets_vehicles.py  # Pet & vehicle models
├── alembic/
│   ├── versions/
│   │   └── 001_add_performance_indexes.py
│   ├── env.py
│   └── script.py.mako
├── scripts/
│   ├── __init__.py
│   ├── seed_data.py          # Seed data script
│   └── db_maintenance.py     # Maintenance utilities
├── alembic.ini
└── requirements.txt
```

## License

MIT
