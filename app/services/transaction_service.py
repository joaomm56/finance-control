from datetime import datetime
from services.account_service import AccountService
# from services.budget_service import check_budget


class TransactionService:

    TRANSACTION_TYPES = ["income", "expense"]

    def __init__(self, supabase_client, account_service: AccountService):
        self.supabase = supabase_client
        self.account_service = account_service
        self.budget_service = None

    def set_budget_service(self, budget_service):
        self.budget_service = budget_service

    # ==========================================================
    # region Validations
    # ==========================================================

    def is_valid_transaction_type(self, tx_type: str):
        return tx_type.lower() in self.TRANSACTION_TYPES

    def is_valid_amount(self, amount: float):
        return amount > 0
    
    # endregion Validations


    # ==========================================================
    # region Transaction CRUD
    # ==========================================================

    def create_transaction(self, user_id: str, account_id: int, amount: float,tx_type: str, category: str, description: str = None):
        # --- Create a transaction and update the account balance. ---

        # Validations
        if not self.is_valid_transaction_type(tx_type):
            raise ValueError(f"Invalid transaction type. Must be one of {self.TRANSACTION_TYPES}")

        if not self.is_valid_amount(amount):
            raise ValueError("Transaction amount must be greater than zero.")

        # Check account ownership
        account = self.account_service.get_account(user_id, account_id)
        if not account:
            raise Exception("Account not found or does not belong to user.")

        # Budget check for expenses
        if tx_type == "expense" and self.budget_service:
            self.budget_service.check_budget(user_id, category, amount)

        # Insert transaction
        data = {
            "account_id": account_id,
            "amount": amount,
            "type": tx_type.lower(),
            "category": category,
            "description": description,
            "date": datetime.utcnow().isoformat()
        }

        try:
            response = self.supabase.table("transactions").insert(data).execute()
        except Exception as e:
            raise Exception(f"Error creating transaction: {e}")

        # Update account balance
        new_balance = account["balance"] + amount if tx_type == "income" else account["balance"] - amount
        self.account_service.create_account(user_id, account["name"], account["type"], new_balance)

        return response.data

    def get_transactions_by_account(self, user_id: str, account_id: int):
        # ---List all transactions for a given account, newest first.---

        account = self.account_service.get_account(user_id, account_id)
        if not account:
            raise Exception("Account not found or unauthorized.")

        try:
            response = (
                self.supabase
                .table("transactions")
                .select("*")
                .eq("account_id", account_id)
                .order("date", desc=True)
                .execute()
            )
            return response.data
        except Exception as e:
            raise Exception(f"Error fetching transactions: {e}")

    def get_transaction(self, transaction_id: int, user_id: str):
        # ---Get single transaction by ID, checking account ownership.---

        try:
            tx = (
                self.supabase
                .table("transactions")
                .select("*")
                .eq("id", transaction_id)
                .single()
                .execute()
            )
        except Exception as e:
            raise Exception(f"Error fetching transaction: {e}")

        account = self.account_service.get_account(user_id, tx.data["account_id"])
        if not account:
            raise Exception("Unauthorized access.")

        return tx.data

    def delete_transaction(self, transaction_id: int, user_id: str):
        # ---Delete a transaction and update the account balance.---

        tx = self.get_transaction(transaction_id, user_id)
        if not tx:
            raise Exception("Transaction not found.")

        # Reverse balance change
        account = self.account_service.get_account(user_id, tx["account_id"])
        if tx["type"] == "income":
            new_balance = account["balance"] - tx["amount"]
        else:
            new_balance = account["balance"] + tx["amount"]

        # Delete transaction
        try:
            self.supabase.table("transactions").delete().eq("id", transaction_id).execute()
        except Exception as e:
            raise Exception(f"Error deleting transaction: {e}")

        # Update account balance
        self.account_service.create_account(user_id, account["name"], account["type"], new_balance)

        return True

    # endregion Transaction CRUD
