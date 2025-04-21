from fastapi import FastAPI, HTTPException
from app.db import connect_db, close_db
from app.models import RegisterUser, LoginUser
from app.auth import create_access_token, verify_token
import os
import bcrypt
from datetime import timedelta
from contextlib import asynccontextmanager

db_pool = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global db_pool
    try:
        db_pool = await connect_db()
        
        schema = os.path.join(os.path.dirname(__file__), '..', 'schema.sql')
        with open(schema, "r") as f:
            schema_sql = f.read()
            
        async with db_pool.acquire() as conn:
            await conn.execute(schema_sql)
            print("Initialized database schema")
    except Exception as e:
        print(f"Error during startup: {e}")
        raise
    
    yield
    
    try:
        await close_db()
        print("Database closed")
    except Exception as e:
        print(f"Error during shutdown: {e}")

app = FastAPI(lifespan=lifespan)
    
@app.post("/register", status_code=201)
async def register_user(user: RegisterUser):
    async with db_pool.acquire() as conn:
        existing = await conn.fetchrow(
            "SELECT user_id FROM users WHERE user_name=$1 OR user_email=$2",
            user.user_name, user.user_email
        )
        
        if (existing):
            raise HTTPException(status_code=400, detail="Username or email already exists")
        
        hashed_password = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        
        new_user = await conn.fetchrow("""
            INSERT INTO users (user_name, user_email, user_password)
            VALUES ($1, $2, $3)
            RETURNING user_id, user_name, user_email, user_privacy
        """, user.user_name, user.user_email, hashed_password)
        
        return {
            "message": "User created",
            "user": dict(new_user)
        }
        
@app.post("/login")
async def login_user(user: LoginUser):
    async with db_pool.acquire() as conn:
        db_user = await conn.fetchrow(
            "SELECT * FROM users WHERE user_name=$1",
            user.user_name
        )
        
        if not db_user or not bcrypt.checkpw(user.password.encode(), db_user["user_password"].encode("utf-8")):
            raise HTTPException(status_code=404, detail="Invalid log in")
        
        token = create_access_token(
            data={
                "user_id": db_user["user_id"]
            },
            expires_delta=timedelta(minutes=60)
        )
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "user_id": db_user["user_id"],
                "user_name": db_user["user_name"],
                "user_email": db_user["user_email"],
                "user_privacy": db_user["user_privacy"]
            }
        }