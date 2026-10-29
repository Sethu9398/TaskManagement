
from datetime import datetime, timedelta, timezone

import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
from fastapi import Cookie, HTTPException, status

SECRET_KEY = "REPLACE_WITH_A_LONG_RANDOM_SECRET"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def create_access_token(user):
    now = datetime.now(timezone.utc)

    payload = {
        "sub": str(user.id),
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "iat": now,
        "exp": now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_access_token(
    access_token: str | None = Cookie(default=None),
):
    # Check whether the cookie exists
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        # Verify JWT signature and expiration
        payload = jwt.decode(
            access_token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
            )

        return user_id

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )

    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token",
        )
