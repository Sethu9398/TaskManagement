import bcrypt

from fastapi import Depends, APIRouter, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.model import Users
from app.schema import UserCreate, UserResponse, UserLogin
from app.database import get_db

router = APIRouter(prefix="/user", tags=["Users"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(data: UserCreate, db: Session = Depends(get_db)):

    email = str(data.email).strip()

    # Check duplicate email only
    existing_email = db.query(Users).filter(Users.email == email).first()

    if existing_email:
        raise HTTPException(
            status_code=409,
            detail="Email already registered",
        )

    # Hash password
    password_bytes = data.password.encode("utf-8")

    if len(password_bytes) > 72:
        raise HTTPException(
            status_code=400,
            detail="Password must not exceed 72 bytes",
        )

    hashed_password = bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt(),
    ).decode("utf-8")

    user = Users(
        name=data.name.strip(),
        email=email,
        password=hashed_password,
    )

    db.add(user)

    try:
        db.commit()
        db.refresh(user)
        print("Registration successful")

    except IntegrityError as exc:
        db.rollback()
        print("Database integrity error:", exc.orig)

        raise HTTPException(
            status_code=409,
            detail="Database constraint violated. Check the email and username constraints.",
        )

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to register user",
        )

    return user


@router.post("/login", response_model=UserLogin)
def login(data: UserLogin, db: Session = Depends(get_db)):

    # Find user by email
    user = db.query(Users).filter(Users.email == str(data.email)).first()

    # Check whether the user exists
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Convert password to bytes
    password_bytes = data.password.encode("utf-8")

    # bcrypt supports up to 72 password bytes
    if len(password_bytes) > 72:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Verify password
    password_is_valid = bcrypt.checkpw(password_bytes, user.password.encode("utf-8"))

    if not password_is_valid:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Return only email and password fields
    return {"email": user.email, "password": data.password}


# @router.post("/createadmin"):
# def create_admin ():
    