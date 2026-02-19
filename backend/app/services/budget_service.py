from datetime import datetime


class BudgetService:

    def __init__(self, supabase_client):
        self.supabase = supabase_client

    # ==========================================================
    # region Budget CRUD
    # ==========================================================

    def create_budget(self, user_id: str, category: str, limit_amount: float):
        if not category.strip():
            raise ValueError("Category cannot be empty.")
        if limit_amount <= 0:
            raise ValueError("Limit must be greater than zero.")

        now = datetime.utcnow()

        existing = (
            self.supabase.table("budgets")
            .select("id")
            .eq("user_id", user_id)
            .eq("category", category.strip())
            .eq("month", now.month)
            .eq("year", now.year)
            .execute()
        )
        if existing.data:
            raise ValueError(f"Budget for '{category}' already exists this month.")

        data = {
            "user_id": user_id,
            "category": category.strip(),
            "limit_amount": limit_amount,
            "month": now.month,
            "year": now.year
        }

        response = self.supabase.table("budgets").insert(data).execute()
        return response.data[0] if response.data else None

    def list_budgets(self, user_id: str):
        now = datetime.utcnow()
        response = (
            self.supabase.table("budgets")
            .select("*")
            .eq("user_id", user_id)
            .eq("month", now.month)
            .eq("year", now.year)
            .order("category")
            .execute()
        )
        return response.data

    def delete_budget(self, user_id: str, budget_id: int):
        budget = (
            self.supabase.table("budgets")
            .select("id")
            .eq("id", budget_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if not budget.data:
            raise Exception("Budget not found or unauthorized.")

        self.supabase.table("budgets").delete().eq("id", budget_id).execute()
        return True

    def get_budgets_with_spent(self, user_id: str):
        """Returns budgets enriched with how much was spent in each category this month."""
        now = datetime.utcnow()
        budgets = self.list_budgets(user_id)

        if not budgets:
            return []

        accounts = (
            self.supabase.table("accounts")
            .select("id")
            .eq("user_id", user_id)
            .execute()
        )
        account_ids = [a["id"] for a in accounts.data]

        if not account_ids:
            return [{**b, "spent": 0, "percentage": 0} for b in budgets]

        # Get expenses this month
        month_start = f"{now.year}-{now.month:02d}-01"
        if now.month == 12:
            month_end = f"{now.year + 1}-01-01"
        else:
            month_end = f"{now.year}-{now.month + 1:02d}-01"

        transactions = (
            self.supabase.table("transactions")
            .select("category, amount")
            .in_("account_id", account_ids)
            .eq("type", "expense")
            .gte("date", month_start)
            .lt("date", month_end)
            .execute()
        )

        # Sum by category (case-insensitive)
        spent_by_category = {}
        for tx in transactions.data:
            cat = tx["category"].strip().lower()
            spent_by_category[cat] = spent_by_category.get(cat, 0) + float(tx["amount"])

        result = []
        for b in budgets:
            spent = spent_by_category.get(b["category"].strip().lower(), 0)
            limit = float(b["limit_amount"])
            result.append({
                **b,
                "spent": round(spent, 2),
                "percentage": round(min((spent / limit) * 100, 100), 1) if limit > 0 else 0
            })

        return result

    # endregion