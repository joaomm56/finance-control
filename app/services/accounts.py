from database import supabase
from datetime import datetime

def create_account(name: str, type: str, balance: float = 0):
    data = {
        "name": name,
        "type": type,
        "balance": balance,
        "created_at": datetime.now().isoformat()
    }

    response = supabase.table("accounts").insert(data).execute()
    return response

def register_account():
    print("\n--- Register the new account ---")
    name = input("Account name: ")
    acc_type = input("Account type: ")
    balance = float(input("Initial balance: "))


    print(f"Account '{name}' created successfully!")
    return create_account(name, acc_type, balance)




def get_account(account_id: int):
    response = (
        supabase
        .table("accounts")
        .select("*")
        .eq("id", account_id)
        .single()
        .execute()
    )

    return response.data
