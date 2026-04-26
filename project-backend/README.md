# Cognitia Backend

For full project documentation (frontend + backend + database + API workflows), see the root guide:

- [../README.md](../README.md)

## Backend Quick Start

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Create .env in this directory:

```env
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST:PORT/DBNAME
SYNC_DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME
JWT_SECRET_KEY=change-this-secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
```

3. Run migrations:

```bash
alembic upgrade head
```

4. Optional seed/admin setup:

```bash
python scripts/seed_data.py
python scripts/create_superadmin.py
```

5. Start API:

```bash
uvicorn app.main:app --reload
```

6. Open API docs:

```text
http://localhost:8000/docs
```

## Tests

```bash
pytest tests -v
```
