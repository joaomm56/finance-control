from datetime import datetime


class TransactionService:

    TRANSACTION_TYPES = ["income", "expense"]

    def __init__(self, supabase_client):
        self.supabase = supabase_client

    # ==========================================================
    # region Validations
    # ==========================================================

    def is_valid_type(self, tx_type: str) -> bool:
        return tx_type.lower() in self.TRANSACTION_TYPES

    def is_valid_amount(self, amount: float) -> bool:
        return amount > 0

    # endregion


    # ==========================================================
    # region Transaction CRUD
    # ==========================================================

    def create_transaction(self, user_id: str, account_id: int, amount: float,
                           tx_type: str, category: str, description: str = None):

        if not self.is_valid_type(tx_type):
            raise ValueError(f"Invalid type. Must be: {self.TRANSACTION_TYPES}")

        if not self.is_valid_amount(amount):
            raise ValueError("Amount must be greater than zero.")

        # Confirm account belongs to user
        account = (
            self.supabase.table("accounts")
            .select("id")
            .eq("id", account_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if not account.data:
            raise Exception("Account not found or unauthorized.")

        # Insert transaction — the DB trigger handles balance update automatically
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
            return response.data[0] if response.data else None
        except Exception as e:
            error_msg = str(e)
            if "Insufficient funds" in error_msg:
                raise Exception("Insufficient funds for this transaction.")
            raise Exception(f"Error creating transaction: {error_msg}")

    def list_transactions(self, user_id: str, account_id: int = None):
        # Get all account IDs for this user
        accounts = (
            self.supabase.table("accounts")
            .select("id")
            .eq("user_id", user_id)
            .execute()
        )
        account_ids = [a["id"] for a in accounts.data]

        if not account_ids:
            return []

        query = (
            self.supabase.table("transactions")
            .select("*")
            .in_("account_id", account_ids)
            .order("date", desc=True)
        )

        if account_id:
            if account_id not in account_ids:
                raise Exception("Account not found or unauthorized.")
            query = query.eq("account_id", account_id)

        response = query.execute()
        return response.data

    def delete_transaction(self, user_id: str, transaction_id: int):
        # Verify ownership via account
        tx = (
            self.supabase.table("transactions")
            .select("*, accounts!inner(user_id)")
            .eq("id", transaction_id)
            .single()
            .execute()
        )
        if not tx.data:
            raise Exception("Transaction not found.")

        if tx.data["accounts"]["user_id"] != user_id:
            raise Exception("Unauthorized.")

        # Delete — trigger handles balance reversal automatically
        self.supabase.table("transactions").delete().eq("id", transaction_id).execute()
        return True

    # endregion