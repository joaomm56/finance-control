from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from app.database import supabase
from app.services.account_service import AccountService
from app.dependencies import get_current_user

router = APIRouter(prefix="/accounts", tags=["Accounts"])
account_service = AccountService(supabase)


# ==========================================================
# region Schemas
# ==========================================================

class CreateAccountRequest(BaseModel):
    name: str
    type: str
    balance: float = 0

class UpdateAccountRequest(BaseModel):
    name: str

# endregion Schemas


# ==========================================================
# region Endpoints
# ==========================================================

@router.get("/")
def list_accounts(current_user: dict = Depends(get_current_user)):
    accounts = account_service.list_accounts(current_user["user_id"])
    return accounts


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_account(body: CreateAccountRequest, current_user: dict = Depends(get_current_user)):
    try:
        account = account_service.create_account(
            user_id=current_user["user_id"],
            name=body.name,
            acc_type=body.type,
            balance=body.balance
        )
        return account
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{account_id}")
def get_account(account_id: int, current_user: dict = Depends(get_current_user)):
    account = account_service.get_account(current_user["user_id"], account_id)
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found.")
    return account


@router.patch("/{account_id}")
def update_account(account_id: int, body: UpdateAccountRequest, current_user: dict = Depends(get_current_user)):
    try:
        updated = account_service.update_account_name(current_user["user_id"], account_id, body.name)
        return updated
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(account_id: int, current_user: dict = Depends(get_current_user)):
    account_service.delete_account(current_user["user_id"], account_id)

# endregion Endpoints