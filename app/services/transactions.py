from database import supabase
from datetime import datetime

def create_transaction(account_id: int, amount: float, type: str, category: str, description: str = None):
    
    if type not in ["income", "expense"]:
        raise ValueError("Type must be 'income' or 'expense'")
    
    if type == "expense":
        check_budget(category, amount)

    data = {
        "account_id": account_id,
        "amount": amount,
        "type": type,
        "category": category,
        "description": description,
        "date": datetime.now().isoformat()
    }

    response = supabase.table("transactions").insert(data).execute()
    return response

def get_transactions_by_account(account_id: int):
    response = (
        supabase
        .table("transactions")
        .select("*")
        .eq("account_id", account_id)
        .order("date", desc=True)
        .execute()
    )
    return response.data

def check_budget(category: str, amount: float):

    now = datetime.now()
    month = now.month
    year = now.year

    budget = (
        supabase
        .table("budgets")
        .select("*")
        .eq("category", category)
        .eq("month", month)
        .eq("year", year)
        .execute()
    )

    if not budget.data:
        return True  # sem budget definido

    limit_amount = float(budget.data[0]["limit_amount"])

    expenses = (
        supabase
        .table("transactions")
        .select("amount")
        .eq("category", category)
        .eq("type", "expense")
        .execute()
    )

    total_spent = sum(float(t["amount"]) for t in expenses.data)

    if total_spent + amount > limit_amount:
        raise Exception("Budget exceeded")

    return True
