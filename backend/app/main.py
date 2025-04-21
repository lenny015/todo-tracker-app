from fastapi import FastAPI, HTTPException
from app.db import connect_db, close_db
from app.models import RegisterUser, LoginUser
import os
import bcrypt

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
        
        inserted_user = await conn.fetchrow("""
            INSERT INTO users (user_name, user_email, user_password)
            VALUES ($1, $2, $3)
            RETURNING user_id, user_name, user_email, user_privacy
        """, user.user_name, user.user_email, hashed_password)
        
        return {
            "message": f"User '{inserted_user["user_name"]}' created",
            "user_id": inserted_user["user_id"],
            "user_name": inserted_user["user_name"],
            "user_email": inserted_user["user_email"],
            "user_privacy": inserted_user["user_privacy"]
        }
        
@app.post("/login")
async def login_user(user: LoginUser):
    async with db_pool.acquire() as conn:
        db_user = await conn.fetchrow(
            "SELECT user_id, user_name, user_email, user_password, user_privacy FROM users WHERE user_name=$1",
            user.user_name
        )
        
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if not bcrypt.checkpw(user.password.encode("utf-8"), db_user['user_password'].encode("utf-8")):
            raise HTTPException(status_code=401, detail="Incorrect password")
        
        return {
            "message": "Login successful",
            "user_id": db_user["user_id"],
            "user_name": db_user["user_name"],
            "user_email": db_user["user_email"],
            "user_privacy": db_user["user_privacy"]
        }