import re
import getpass
from database import supabase

class AuthService:

    def __init__(self, supabase_client, max_login_attempts=5):
        self.supabase = supabase_client
        self.max_login_attempts = max_login_attempts
        self.login_attempts = 0

    # ==========================================================
    # region Validations
    # ==========================================================

    def is_valid_email(self, email):
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None

    def is_valid_username(self, username):
        return re.match(r'^[a-zA-Z0-9_-]{3,}$', username) is not None
    
    def is_valid_phone(self, phone):
        return phone.isdigit() and 9 <= len(phone) <= 15


    def is_valid_password(self, password):
        if len(password) < 6:
            return False
        if not re.search(r'[A-Z]', password):
            return False
        if not re.search(r'[a-z]', password):
            return False
        if not re.search(r'\d', password):
            return False
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            return False
        return True

    # endregion Validations


    # ==========================================================
    # region User Input
    # ==========================================================

    def get_user_credentials(self):
        while True:
            username = input("Username: ").strip()
            if self.is_valid_username(username):
                break
            print("Error: Username must be at least 3 characters and contain only letters, numbers, _ or -")

        while True:
            email = input("Email: ").strip().lower()
            if self.is_valid_email(email):
                break
            print("Error: Invalid email format.")

        while True:
            phone_number = input("Phone number (optional): ").strip()
            if not phone_number:
                phone_number = None
                break
            if self.is_valid_phone(phone_number):
                break
            print("Error: Phone number must be 9-15 digits.")

        while True:
            password = getpass.getpass("Password: ").strip()
            if self.is_valid_password(password):
                break
            print("Error: Weak password. \n- least 6 characters\n- including 1 uppercase\n- 1 lowercase\n- 1 number\n- 1 symbol.")

        return username, email, password, phone_number
    
    # endregion User Input


    # ==========================================================
    # region Registration
    # ==========================================================

    def register_user(self):
        username, email, password, phone_number = self.get_user_credentials()

        try:
            response = self.supabase.auth.sign_up({
                "email": email,
                "password": password
            })

            if response.user:
                profile_data = {
                    "id": response.user.id,
                    "username": username,
                    "email": email,
                    "phone_number": phone_number
                }

                self.supabase.table("profiles").insert(profile_data).execute()
                print("User registered successfully!")
                return response

        except Exception as e:
            print("Registration failed:", str(e))
            return None

    # endregion Registration


    # ==========================================================
    # region Login
    # ==========================================================

    def login_user(self):
        self.attempts = 0

        while self.attempts < self.max_attempts:
            identifier = input("Email or Username: ").strip()
            password = getpass.getpass("Password: ")

            try:
                if self.is_valid_email(identifier):
                    response = self.supabase.auth.sign_in_with_password({
                        "email": identifier,
                        "password": password
                    })
                else:
                    user = self.supabase.table("profiles") \
                        .select("email") \
                        .eq("username", identifier) \
                        .single()

                    if not user.data:
                        print("Username not found.")
                        self.attempts += 1
                        continue

                    response = self.supabase.auth.sign_in_with_password({
                        "email": user.data["email"],
                        "password": password
                    })

                if response.session:
                    print(f"Login successful, Welcome {identifier}.")
                    return response.session

            except Exception:
                print("Invalid email/username or password.")

            self.attempts += 1
            remaining = self.max_attempts - self.attempts
            print(f"Remaining attempts: {remaining}\n")

        print("Maximum login attempts reached.")
        return None

    # endregion Login
