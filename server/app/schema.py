
from datetime import datetime
from pydantic import BaseModel, ConfigDict


# Fields required when creating a user
class UserCreate(BaseModel):
    name: str
    email:str
    password: str

class UserLogin(BaseModel):
    email:str
    password: str

# Fields returned by the API
class UserResponse(BaseModel):
    id: int
    name: str
    email:str
    created_at: datetime
    updated_at: datetime
