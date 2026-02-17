from unicodedata import name
from services.accounts import create_account, register_account
from services.transactions import create_transaction
from services.report import get_monthly_report

def menu():
    while True:
        print("\n=== FINANCE CONTROL ===")
        print("1 - Criar Conta")
        print("2 - Criar Transação")
        print("3 - Ver Relatório Mensal")
        print("0 - Sair")

        choice = input("Escolha uma opção: ")

        if choice == "1":
            register_account()
            
            print("Conta criada com sucesso!")

        elif choice == "2":
            account_id = int(input("ID da conta: "))
            amount = float(input("Valor: "))
            type = input("Tipo (income/expense): ")
            category = input("Categoria: ")
            description = input("Descrição: ")

            try:
                create_transaction(account_id, amount, type, category, description)
                print("Transação criada com sucesso!")
            except Exception as e:
                print("Erro:", e)

        elif choice == "3":
            month = int(input("Mês: "))
            year = int(input("Ano: "))
            report = get_monthly_report(month, year)
            print(report)

        elif choice == "0":
            break

        else:
            print("Opção inválida")
