from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from app.database import supabase
from app.services.transaction_service import TransactionService
from app.dependencies import get_current_user

router = APIRouter(prefix="/transactions", tags=["Transactions"])
transaction_service = TransactionService(supabase)


# ==========================================================
# region Schemas
# ==========================================================

class CreateTransactionRequest(BaseModel):
    account_id: int
    amount: float
    type: str
    category: str
    description: Optional[str] = None
    date: Optional[str] = None
# endregion


# ==========================================================
# region Endpoints
# ==========================================================

@router.get("/")
def list_transactions(account_id: Optional[int] = None, current_user: dict = Depends(get_current_user)):
    try:
        return transaction_service.list_transactions(current_user["user_id"], account_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_transaction(body: CreateTransactionRequest, current_user: dict = Depends(get_current_user)):
    try:
        tx = transaction_service.create_transaction(
            user_id=current_user["user_id"],
            account_id=body.account_id,
            amount=body.amount,
            tx_type=body.type,
            category=body.category,
            description=body.description
        )
        return tx
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(transaction_id: int, current_user: dict = Depends(get_current_user)):
    try:
        transaction_service.delete_transaction(current_user["user_id"], transaction_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

# endregion