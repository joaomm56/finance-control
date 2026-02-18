from database import supabase
from services.auth_service import AuthService
from services.account_service import AccountService
from services.transaction_service import TransactionService
from services.budget_service import BudgetService


# Inicializa os serviços
auth_service = AuthService(supabase)
account_service = AccountService(supabase)
transaction_service = TransactionService(supabase, account_service)
budget_service = BudgetService(supabase, transaction_service)

transaction_service.set_budget_service(budget_service)


# ----------------------------
# Funções de fluxo (UI)
# ----------------------------

def create_account_flow(user_id):
    print("\n--- Create Account ---")
    name = input("Account name: ").strip()
    acc_type = input("Account type (saving/investment/current): ").strip().lower()

    while True:
        try:
            balance = float(input("Initial balance: "))
            break
        except ValueError:
            print("Please enter a valid number.")

    try:
        account = account_service.create_account(
            user_id=user_id,
            name=name,
            acc_type=acc_type,
            balance=balance
        )
        print("Account created successfully!")
        print(account)
    except Exception as e:
        print("Error:", e)


def create_budget_flow(user_id):
    print("\n--- Create Budget ---")
    category = input("Category name: ").strip()

    while True:
        try:
            limit = float(input("Budget limit: "))
            break
        except ValueError:
            print("Please enter a valid number.")

    try:
        budget = budget_service.create_budget(user_id, category, limit)
        print("Budget created successfully!")
        print(budget)
    except Exception as e:
        print("Error:", e)


def create_transaction_flow(user_id):
    print("\n--- Create Transaction ---")

    accounts = account_service.list_accounts(user_id)
    if not accounts:
        print("No accounts found. Please create an account first.")
        return

    print("Your accounts:")
    for acc in accounts:
        print(f"{acc['id']} - {acc['name']} ({acc['type']}) | Balance: {acc['balance']}")

    while True:
        try:
            account_id = int(input("Select account ID: "))
            break
        except ValueError:
            print("Enter a valid number.")

    tx_type = input("Transaction type (income/expense): ").strip().lower()
    category = input("Category: ").strip()
    description = input("Description (optional): ").strip() or None

    while True:
        try:
            amount = float(input("Amount: "))
            break
        except ValueError:
            print("Enter a valid number.")

    try:
        # Verifica budget antes de criar despesa
        if tx_type == "expense":
            budget_service.check_budget(user_id, category, amount)

        tx = transaction_service.create_transaction(
            user_id=user_id,
            account_id=account_id,
            amount=amount,
            tx_type=tx_type,
            category=category,
            description=description
        )
        print("Transaction created successfully!")
        print(tx)
    except Exception as e:
        print("Error:", e)


def list_accounts_flow(user_id):
    print("\n--- List Accounts ---")
    accounts = account_service.list_accounts(user_id)
    if not accounts:
        print("No accounts found.")
        return
    for acc in accounts:
        print(f"{acc['id']} - {acc['name']} ({acc['type']}) | Balance: {acc['balance']}")


def list_transactions_flow(user_id):
    print("\n--- List Transactions ---")
    accounts = account_service.list_accounts(user_id)
    if not accounts:
        print("No accounts found.")
        return

    for acc in accounts:
        print(f"\nTransactions for {acc['name']} ({acc['type']}):")
        txs = transaction_service.get_transactions_by_account(user_id, acc["id"])
        if not txs:
            print("  No transactions.")
        else:
            for t in txs:
                print(f"  {t['id']} - {t['type']} | {t['category']} | {t['amount']} | {t.get('description')}")


# ----------------------------
# Main Menu
# ----------------------------
def main():
    print("Welcome to Finance App!")

    while True:
        print("\n1 - Login")
        print("2 - Register")
        print("3 - Exit")

        choice = input("Choose option: ").strip()
        if choice == "1":
            session = auth_service.login_user()
            if session:
                user_id = session.user.id
                user_menu(user_id)
        elif choice == "2":
            auth_service.register_user()
        elif choice == "3":
            break
        else:
            print("Invalid option. Try again.")


def user_menu(user_id):
    while True:
        print("\n--- User Menu ---")
        print("1 - Create Account")
        print("2 - List Accounts")
        print("3 - Create Transaction")
        print("4 - List Transactions")
        print("5 - Create Budget")
        print("6 - Logout")

        choice = input("Choose option: ").strip()
        if choice == "1":
            create_account_flow(user_id)
        elif choice == "2":
            list_accounts_flow(user_id)
        elif choice == "3":
            create_transaction_flow(user_id)
        elif choice == "4":
            list_transactions_flow(user_id)
        elif choice == "5":
            create_budget_flow(user_id)
        elif choice == "6":
            print("Logging out...")
            break
        else:
            print("Invalid option. Try again.")


if __name__ == "__main__":
    main()
