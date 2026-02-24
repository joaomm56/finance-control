from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from app.database import supabase
from app.services.goal_service import GoalService
from app.dependencies import get_current_user

router = APIRouter(prefix="/goals", tags=["Goals"])
goal_service = GoalService(supabase)


class CreateGoalRequest(BaseModel):
    name: str
    target_amount: float
    deadline: Optional[str] = None  # format: YYYY-MM-DD


class AddFundsRequest(BaseModel):
    amount: float


@router.get("/")
def list_goals(current_user: dict = Depends(get_current_user)):
    return goal_service.list_goals(current_user["user_id"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_goal(body: CreateGoalRequest, current_user: dict = Depends(get_current_user)):
    try:
        return goal_service.create_goal(
            user_id=current_user["user_id"],
            name=body.name,
            target_amount=body.target_amount,
            deadline=body.deadline
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/{goal_id}/add-funds")
def add_funds(goal_id: int, body: AddFundsRequest, current_user: dict = Depends(get_current_user)):
    try:
        return goal_service.add_funds(current_user["user_id"], goal_id, body.amount)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(goal_id: int, current_user: dict = Depends(get_current_user)):
    try:
        goal_service.delete_goal(current_user["user_id"], goal_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))