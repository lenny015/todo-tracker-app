from fastapi import FastAPI, HTTPException, Depends, Header, Path, Query
from app.db import connect_db, close_db
from app.models import RegisterUser, LoginUser, CreateTask
from app.auth import create_access_token, verify_token
from app.cors import setup_cors
import os
import bcrypt
from datetime import timedelta, datetime
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
setup_cors(app)

def get_user_token(auth: str = Header(...)):
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization")
    token = auth[7:]
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload["user_id"]
    
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
        
@app.post("/tasks", status_code=201)
async def create_task(task: CreateTask, user_id: int = Depends(get_user_token)):
    async with db_pool.acquire() as conn:
        new_task = await conn.fetchrow("""
            INSERT INTO tasks (user_id, title, description, due_date)
            VALUES ($1, $2, $3, $4)
            RETURNING task_id, title, description, status, due_date      
            """, user_id, task.title, task.description, task.due_date)
        
        return {
            "message": "Task created",
            "task": dict(new_task)
        }
        
@app.post("/tasks/{task_id}/complete")
async def complete_task(task_id: int = Path(...), user_id: int = Depends(get_user_token)):
    async with db_pool.acquire() as conn:
        task = await conn.fetchrow("""
            SELECT * FROM tasks WHERE task_id=$1 AND user_id=$2
            """, task_id, user_id)
        
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        if task["status"] == "completed":
            raise HTTPException(status_code=400, detail="Task already completed")
            
        await conn.execute("""
            UPDATE tasks SET status='completed' WHERE task_id=$1
            """, task_id)
            
        await conn.execute("""
            INSERT INTO task_completion_history (task_id, completed_at) VALUES
            ($1, $2)
            """, task_id, datetime.now())
        
@app.get("/tasks")
async def get_tasks(user_id: int = Depends(get_user_token), status: str = Query("pending", regex="^(pending|completed)$")):
    async with db_pool.acquire() as conn:
        tasks = await conn.fetch("""
            SELECT task_id, title, description, status, due_date, created_at
            FROM tasks
            WHERE user_id=$1 AND status=$2
            ORDER BY due_date ASC
            """, user_id, status)
        
        return [dict(task) for task in tasks]