
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# Fields required when creating a user
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    # Optional on purpose: the client does not have to send a role.
    # Public registration always stores "user"; admins are created through
    # /user/createadmin, so a client cannot register itself as an admin.
    role: Optional[str] = Field(
        default="user",
        description="Ignored by /user/register. New accounts always get the 'user' role.",
    )


class UserLogin(BaseModel):
    email: str
    password: str


# Fields returned by the API
class UserResponse(BaseModel):
    # Allows returning a SQLAlchemy model instance directly from the route
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    created_at: datetime
    updated_at: datetime


# Fields returned for the currently authenticated user (GET /user/me)
class UserMeResponse(UserResponse):
    role: str



class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    is_complete: bool | None = None


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    is_complete: bool
    user_id: int

class TaskCompleteUpdate(BaseModel):
    is_complete: bool
