import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
db_pool = None

async def connect_db():
    global db_pool
    if db_pool is None:
        return await asyncpg.create_pool(DATABASE_URL)
    return db_pool

async def close_db():
    global db_pool
    if db_pool:
        await db_pool.close()
        db_pool = None