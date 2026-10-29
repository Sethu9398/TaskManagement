import bcrypt

from fastapi import Depends, APIRouter, HTTPException, Response, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.model import Users
from app.schema import UserCreate, UserResponse, UserLogin, UserMeResponse
from app.database import get_db
from ..jwt_handler import (
    create_access_token,
    verify_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

router = APIRouter(prefix="/user", tags=["Users"])


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")

    if len(password_bytes) > 72:
        raise HTTPException(
            status_code=400,
            detail="Password must not exceed 72 bytes",
        )

    return bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt(),
    ).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_bytes = plain_password.encode("utf-8")

    if len(password_bytes) > 72:
        return False

    return bcrypt.checkpw(
        password_bytes,
        hashed_password.encode("utf-8"),
    )


@router.post("/register", response_model=UserResponse, status_code=201)
def register(data: UserCreate, db: Session = Depends(get_db)):

    email = data.email.strip().lower()

    # Check duplicate email
    existing_user = db.query(Users).filter(Users.email == email).first()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email already registered",
        )

    # Hash password using your existing bcrypt function
    hashed_password = hash_password(data.password)

    # Public registration always creates a normal user
    user = Users(
        name=data.name.strip(),
        email=email,
        password=hashed_password,
        role="user",
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)

        return user

    except IntegrityError as exc:
        db.rollback()
        print("Database integrity error:", exc.orig)

        raise HTTPException(
            status_code=409,
            detail="Email already registered or another database constraint was violated",
        )

    except SQLAlchemyError as exc:
        db.rollback()
        print("Database error:", str(exc))

        raise HTTPException(
            status_code=500,
            detail="Database error during registration",
        )


@router.post("/login", response_model=UserLogin)
def login(
    data: UserLogin,
    response: Response,
    db: Session = Depends(get_db),
):

    # Find user by email
    user = db.query(Users).filter(Users.email == str(data.email)).first()

    # Check whether the user exists
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    password_is_valid = verify_password(data.password, user.password)

    if not password_is_valid:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user)

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,  # Local HTTP development only
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
        path="/",
    )

    # Return only email and password fields
    return {"email": user.email, "password": data.password, "role": user.role}


@router.get("/me", response_model=UserMeResponse)
def get_current_user(
    user_id: str = Depends(verify_access_token),
    db: Session = Depends(get_db),
):
    """Return the user behind the access_token cookie.

    The frontend calls this on every protected page load, which is what keeps
    the session alive across navigation and page refreshes.
    """
    try:
        user_pk = int(user_id)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user = db.query(Users).filter(Users.id == user_pk).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
        )

    return user


@router.post(
    "/createadmin",
    response_model=UserResponse,
    status_code=201,
)
def create_default_admin(db: Session = Depends(get_db)):
    admin_email = "admin@example.com"
    admin_password = "AdminPassword123!"

    try:
        existing_admin = db.query(Users).filter(Users.email == admin_email).first()

        if existing_admin:
            raise HTTPException(
                status_code=409,
                detail="Default admin already exists",
            )

        hashed_password = hash_password(admin_password)

        default_admin = Users(
            name="Super Admin",
            email=admin_email,
            password=hashed_password,
            role="admin",
        )

        db.add(default_admin)
        db.commit()
        db.refresh(default_admin)

        return default_admin

    except HTTPException:
        raise

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Admin already exists or a database constraint was violated",
        )

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to create default admin and internal error",
        )
