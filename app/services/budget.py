from database import supabase

def create_budget(category: str, month: int, year: int, limit_amount: float):

    data = {
        "category": category,
        "month": month,
        "year": year,
        "limit_amount": limit_amount
    }

    return supabase.table("budgets").insert(data).execute()
