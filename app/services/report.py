from database import supabase
from datetime import datetime

def get_monthly_report(month: int, year: int):

    start_date = f"{year}-{month:02d}-01"
    
    if month == 12:
        end_date = f"{year+1}-01-01"
    else:
        end_date = f"{year}-{month+1:02d}-01"

    response = (
        supabase
        .table("transactions")
        .select("amount, type, category")
        .gte("date", start_date)
        .lt("date", end_date)
        .execute()
    )

    transactions = response.data

    total_income = 0
    total_expense = 0
    category_summary = {}

    for t in transactions:
        if t["type"] == "income":
            total_income += float(t["amount"])
        else:
            total_expense += float(t["amount"])

            cat = t["category"]
            if cat not in category_summary:
                category_summary[cat] = 0
            category_summary[cat] += float(t["amount"])

    return {
        "income": total_income,
        "expense": total_expense,
        "net": total_income - total_expense,
        "by_category": category_summary
    }
