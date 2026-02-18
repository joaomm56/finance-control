from datetime import datetime
# from services.transaction_service import TransactionService


class BudgetService:

    def __init__(self, supabase_client, transaction_service: "TransactionService"):
        self.supabase = supabase_client
        self.transaction_service = transaction_service


    # ==========================================================
    # region Validations
    # ==========================================================

    def is_valid_limit(self, limit_amount: float):
        return limit_amount > 0

    # endregion Validations


    # ==========================================================
    # region Budget CRUD
    # ==========================================================

    def create_budget(self, user_id: str, category: str, limit_amount: float):
        if not self.is_valid_limit(limit_amount):
            raise ValueError("Budget limit must be greater than zero.")

        now = datetime.utcnow()
        data = {
            "user_id": user_id,
            "category": category.strip(),
            "month": now.month,
            "year": now.year,
            "limit_amount": limit_amount
        }

        try:
            response = self.supabase.table("budgets").insert(data).execute()
            return response.data
        except Exception as e:
            raise Exception(f"Error creating budget: {e}")

    def list_budgets(self, user_id: str):
        # ---List all budgets of the user for the current month---
        now = datetime.utcnow()
        try:
            response = (
                self.supabase.table("budgets")
                .select("*")
                .eq("user_id", user_id)
                .eq("month", now.month)
                .eq("year", now.year)
                .execute()
            )
            return response.data
        except Exception as e:
            raise Exception(f"Error fetching budgets: {e}")

    def check_budget(self, user_id: str, category: str, amount: float):
        # ---Check if adding this amount exceeds the budget"""
        now = datetime.utcnow()

        # Get budget for category
        budget_response = (
            self.supabase.table("budgets")
            .select("*")
            .eq("user_id", user_id)
            .eq("category", category)
            .eq("month", now.month)
            .eq("year", now.year)
            .execute()
        )

        if not budget_response.data:
            return True  # no budget set → allowed

        limit_amount = float(budget_response.data[0]["limit_amount"])

        # Sum transactions for this category
        total_spent = 0
        accounts = self.transaction_service.account_service.list_accounts(user_id)
        for acc in accounts:
            txs = self.transaction_service.get_transactions_by_account(user_id, acc["id"])
            for t in txs:
                if t["type"] == "expense" and t["category"] == category:
                    total_spent += float(t["amount"])

        if total_spent + amount > limit_amount:
            raise Exception(f"Budget exceeded for category '{category}'. Limit: {limit_amount}, Current spent: {total_spent}, Attempted: {amount}")

        return True

    # endregion Budget CRUD
