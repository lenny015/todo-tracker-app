from fastapi import FastAPI
from app.db import connect_db, close_db
import os

app = FastAPI()
db_pool = None

@app.on_event("startup")
async def startup():
    global db_pool
    db_pool = await connect_db()
    
    schema = os.path.join(os.path.dirname(__file__), '..', 'schema.sql')
    with open(schema, "r") as f:
        schema_sql = f.read()
        
    async with db_pool.acquire() as conn:
        await conn.execute(schema_sql)
        print("Initialized database schema")
        
@app.on_event("shutdown")
async def shutdown():
    await close_db