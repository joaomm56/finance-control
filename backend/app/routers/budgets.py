from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from app.database import supabase
from app.services.budget_service import BudgetService
from app.dependencies import get_current_user

router = APIRouter(prefix="/budgets", tags=["Budgets"])
budget_service = BudgetService(supabase)


class CreateBudgetRequest(BaseModel):
    category: str
    limit_amount: float


@router.get("/")
def list_budgets(current_user: dict = Depends(get_current_user)):
    return budget_service.get_budgets_with_spent(current_user["user_id"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_budget(body: CreateBudgetRequest, current_user: dict = Depends(get_current_user)):
    try:
        return budget_service.create_budget(
            user_id=current_user["user_id"],
            category=body.category,
            limit_amount=body.limit_amount
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(budget_id: int, current_user: dict = Depends(get_current_user)):
    try:
        budget_service.delete_budget(current_user["user_id"], budget_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))