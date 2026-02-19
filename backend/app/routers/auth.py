from fastapi import APIRouter, HTTPException, status
from typing import Optional
from pydantic import BaseModel
from app.database import supabase
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])
auth_service = AuthService(supabase)


# ==========================================================
# region Schemas
# ==========================================================

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    phone_number: Optional[str] = None


class LoginRequest(BaseModel):
    identifier: str   # email or username
    password: str

# endregion Schemas


# ==========================================================
# region Endpoints
# ==========================================================

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest):
    try:
        user = auth_service.register_user(
            username=body.username,
            email=body.email,
            password=body.password,
            phone_number=body.phone_number
        )
        return {"message": "User registered successfully!", "user": user}

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/login")
def login(body: LoginRequest):
    try:
        session = auth_service.login_user(
            identifier=body.identifier,
            password=body.password
        )
        return session

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# endregion Endpoints