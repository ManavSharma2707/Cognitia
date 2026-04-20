import asyncio
import os
import sys
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def ensure_async_database_url() -> None:
    load_dotenv()
    db_url = os.getenv("DATABASE_URL", "")
    if not db_url:
        return

    if db_url.startswith("postgresql://") and "+asyncpg" not in db_url:
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif db_url.startswith("postgres://") and "+asyncpg" not in db_url:
        db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)

    parts = urlsplit(db_url)
    query = parse_qsl(parts.query, keep_blank_values=True)
    normalized_query: list[tuple[str, str]] = []
    for key, value in query:
        if key == "sslmode":
            if value:
                normalized_query.append(("ssl", value))
        else:
            normalized_query.append((key, value))

    db_url = urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(normalized_query), parts.fragment))
    os.environ["DATABASE_URL"] = db_url


ensure_async_database_url()

from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.repositories.user_repository import create_user, get_user_by_email


async def main():
    email = input("Admin email: ").strip()
    password = input("Admin password (min 8 chars): ").strip()

    if len(password) < 8:
        print("Password too short.")
        return

    async with AsyncSessionLocal() as db:
        existing = await get_user_by_email(db, email)
        if existing:
            print(f"User {email} already exists.")
            return

        user = await create_user(db, email, hash_password(password), "System Admin", "admin")
        await db.commit()
        print(f"Admin created. user_id={user.user_id}")


if __name__ == "__main__":
    asyncio.run(main())
