from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date

class RegisterUser(BaseModel):
    user_name: str = Field(..., min_length=3, max_length=50)
    user_email: EmailStr
    password: str = Field(..., min_length=6)
    
class LoginUser(BaseModel):
    user_name: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    
class CreateTask(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None