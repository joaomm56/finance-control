from datetime import datetime


class AccountService:

    ACCOUNT_TYPES = ["saving", "investment", "current"]

    def __init__(self, supabase_client):
        self.supabase = supabase_client


    # ==========================================================
    # region Validations
    # ==========================================================

    def is_valid_account_type(self, acc_type: str):
        return acc_type.lower() in self.ACCOUNT_TYPES

    def is_valid_balance(self, balance: float):
        return balance >= 0

    # endregion Validations


    # ==========================================================
    # region Account Creation
    # ==========================================================

    def create_account(self, user_id: str, name: str, acc_type: str, balance: float = 0):
        if not name.strip():
            raise ValueError("Account name cannot be empty.")

        if not self.is_valid_account_type(acc_type):
            raise ValueError(f"Invalid account type. Allowed: {self.ACCOUNT_TYPES}")

        if not self.is_valid_balance(balance):
            raise ValueError("Initial balance cannot be negative.")

        data = {
            "user_id": user_id,
            "name": name.strip(),
            "type": acc_type.lower(),
            "balance": balance,
            "created_at": datetime.utcnow().isoformat()
        }

        try:
            response = self.supabase.table("accounts").insert(data).execute()
            return response.data
        except Exception as e:
            raise Exception(f"Error creating account: {str(e)}")

    # endregion Account Creation

    # ==========================================================
    # region Account Retrieval
    # ==========================================================

    def get_account(self, user_id: str, account_id: int):
        try:
            response = (
                self.supabase
                .table("accounts")
                .select("*")
                .eq("id", account_id)
                .eq("user_id", user_id)
                .single()
                .execute()
            )

            return response.data
        except Exception:
            return None

    def list_accounts(self, user_id: str):
        try:
            response = (
                self.supabase
                .table("accounts")
                .select("*")
                .eq("user_id", user_id)
                .execute()
            )

            return response.data
        except Exception:
            return []

    # endregion Account Retrieval

    # ==========================================================
    # region Account Update
    # ==========================================================

    def update_account_name(self, user_id: str, account_id: int, new_name: str):
        if not new_name.strip():
            raise ValueError("Account name cannot be empty.")

        try:
            response = (
                self.supabase
                .table("accounts")
                .update({"name": new_name.strip()})
                .eq("id", account_id)
                .eq("user_id", user_id)
                .execute()
            )

            return response.data
        except Exception as e:
            raise Exception(f"Error updating account: {str(e)}")

    # endregion Account Update

    # ==========================================================
    # region Account Deletion
    # ==========================================================

    def delete_account(self, user_id: str, account_id: int):
        try:
            response = (
                self.supabase
                .table("accounts")
                .delete()
                .eq("id", account_id)
                .eq("user_id", user_id)
                .execute()
            )

            return response.data
        except Exception as e:
            raise Exception(f"Error deleting account: {str(e)}")

    # endregion Account Deletion
