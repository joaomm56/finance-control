from datetime import datetime


class GoalService:

    def __init__(self, supabase_client):
        self.supabase = supabase_client

    # ==========================================================
    # region Goal CRUD
    # ==========================================================

    def create_goal(self, user_id: str, name: str, target_amount: float, deadline: str = None):
        if not name.strip():
            raise ValueError("Goal name cannot be empty.")
        if target_amount <= 0:
            raise ValueError("Target amount must be greater than zero.")

        data = {
            "user_id": user_id,
            "name": name.strip(),
            "target_amount": target_amount,
            "current_amount": 0,
            "deadline": deadline
        }

        response = self.supabase.table("goals").insert(data).execute()
        return response.data[0] if response.data else None

    def list_goals(self, user_id: str):
        response = (
            self.supabase.table("goals")
            .select("*")
            .eq("user_id", user_id)
            .order("deadline", desc=False, nullsfirst=False)
            .execute()
        )
        # Add percentage to each goal
        result = []
        for g in response.data:
            target = float(g["target_amount"])
            current = float(g["current_amount"] or 0)
            result.append({
                **g,
                "percentage": round(min((current / target) * 100, 100), 1) if target > 0 else 0,
                "remaining": round(max(target - current, 0), 2)
            })
        return result

    def add_funds(self, user_id: str, goal_id: int, amount: float):
        if amount <= 0:
            raise ValueError("Amount must be greater than zero.")

        goal = (
            self.supabase.table("goals")
            .select("*")
            .eq("id", goal_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if not goal.data:
            raise Exception("Goal not found or unauthorized.")

        new_amount = float(goal.data["current_amount"] or 0) + amount
        target = float(goal.data["target_amount"])

        if new_amount > target:
            raise ValueError(f"Amount exceeds target. Max you can add: €{target - float(goal.data['current_amount']):.2f}")

        response = (
            self.supabase.table("goals")
            .update({"current_amount": new_amount})
            .eq("id", goal_id)
            .execute()
        )
        return response.data[0] if response.data else None

    def delete_goal(self, user_id: str, goal_id: int):
        goal = (
            self.supabase.table("goals")
            .select("id")
            .eq("id", goal_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if not goal.data:
            raise Exception("Goal not found or unauthorized.")

        self.supabase.table("goals").delete().eq("id", goal_id).execute()
        return True

    # endregion