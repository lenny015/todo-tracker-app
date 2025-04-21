from fastapi import FastAPI, HTTPException
from app.db import connect_db, close_db
import os
from pydantic import BaseModel, EmailStr, Field
import bcrypt

app = FastAPI()
db_pool = None

class RegisterUser(BaseModel):
    user_name: str = Field(..., min_length=3, max_length=50)
    user_email: EmailStr
    password: str = Field(..., min_length=6)

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
    
@app.post("/register")
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
            "Message": "User created",
            "user_id": inserted_user["user_id"],
            "user_name": inserted_user["user_name"],
            "user_email": inserted_user["user_email"],
            "user_privacy": inserted_user["user_privacy"]
        }