from fastapi import FastAPI, HTTPException, Depends, Header, Path, Query, Body
from app.db import connect_db, close_db
from app.models import RegisterUser, LoginUser, CreateTask, UpdateTask
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
    
@app.delete("/tasks/{task_id}")
async def delete_task(task_id: int = Path(...), user_id: int = Depends(get_user_token)):
    async with db_pool.acquire() as conn:
        task = await conn.fetchrow("""
            SELECT * FROM tasks WHERE task_id=$1 AND user_id=$2
        """, task_id, user_id)

        if not task:
            raise HTTPException(status_code=404, detail="Task not found or unauthorized")

        await conn.execute("""
            DELETE FROM tasks WHERE task_id=$1
        """, task_id)

    return {"message": f"Task {task_id} deleted successfully"}
    
@app.post("/follow/{following_user}")
async def follow_user(following_user: int = Path(...), user_id = Depends(get_user_token)):
    if user_id == following_user:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    
    async with db_pool.acquire() as conn:
        try:
            await conn.execute("""
                INSERT INTO FOLLOWERS (follower_id, following_id)
                VALUES ($1, $2)
                """, user_id, following_user)
        except Exception as e:
            raise HTTPException(status_code=400, detail="Already following user")
        
    return {
        "message": f"User {user_id} now following user {following_user}"
    }
    
@app.delete("/unfollow/{unfollowing_user}")
async def unfollow_user(unfollowing_user:int = Path(...), user_id = Depends(get_user_token)):
    async with db_pool.acquire() as conn:
        result = await conn.execute("""
            DELETE FROM FOLLOWERS
            WHERE follower_id = $1 AND following_id = $2
            """, user_id, unfollowing_user)
        
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail=f"User {user_id} not following {unfollowing_user}")

    return {
        "message": f"User {user_id} unfollowed {unfollowing_user}"
    }
    
@app.put("/tasks/{task_id}")
async def update_task(task_id: int = Path(...), update_data: UpdateTask = Body(...), user_id = Depends(get_user_token)):
    async with db_pool.acquire() as conn:
        task = await conn.fetchrow("""
            SELECT * FROM tasks WHERE task_id=$1 AND user_id=$2
            """, task_id, user_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        fields = []
        values = []
        
        if update_data.title is not None:
            fields.append(f"title = ${len(values) + 1}")
            values.append(update_data.title)
        if update_data.description is not None:
            fields.append(f"description = ${len(values) + 1}")
            values.append(update_data.description)
        if update_data.due_date is not None:
            fields.append(f"due_date = ${len(values) + 1}")
            values.append(update_data.due_date)
            
        if not fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        query = f"""
            UPDATE tasks SET {', '. join(fields)}
            WHERE task_id = ${len(values) + 1}
        """
        values.append(task_id)
        
        await conn.execute(query, *values)
        
        updated_task = await conn.fetchrow("""
            SELECT task_id, title, description, status, due_date, created_at
            FROM tasks
            WHERE task_id=$1
            """, task_id)
        
        return {"message": "Task updated", "task": dict(updated_task)}
    
@app.get("/user/task_history")
async def get_task_history(user_id: int = Depends(get_user_token)):
    async with db_pool.acquire() as conn:
        task_history = await conn.fetch("""
            SELECT completed_at::date, COUNT(*) AS tasks_completed
            FROM task_completion_history
            WHERE task_id IN (SELECT task_id FROM tasks WHERE user_id=$1)
            GROUP BY completed_at::date
            ORDER BY completed_at DESC
        """, user_id)
        
    return {"task_history": [dict(i) for i in task_history]}

@app.get("/user/followers")
async def get_followers(user_id: int = Depends(get_user_token)):
    async with db_pool.acquire() as conn:
        result = await conn.fetch("""
            SELECT COUNT(*) FROM followers WHERE following_id = $1              
            """, user_id)
        
    return {"follower_count": result[0]['count']}

