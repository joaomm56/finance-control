from database import supabase

def list_accounts():
    # Busca todos os dados da tabela accounts
    response = supabase.table("accounts").select("*").execute()
    print("--- Contas no Banco ---")
    for row in response.data:
        print(f"ID: {row['id']} | Nome: {row['name']} | Saldo: R$ {row['balance']}")

def list_transactions():
    # Busca todas as transações
    response = supabase.table("transactions").select("*").execute()
    print("\n--- Transações no Banco ---")
    for row in response.data:
        print(f"ID: {row['id']} | Tipo: {row['type']} | Valor: R$ {row['amount']}")

if __name__ == "__main__":
    list_accounts()
    list_transactions()