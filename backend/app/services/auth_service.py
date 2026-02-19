import re
# import getpass
# from database import supabase

class AuthService:

    def __init__(self, supabase_client, max_attempts=4):
        self.supabase = supabase_client
        self.max_attempts = max_attempts
        self.attempts = 0

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

    def register_user(self, username: str, email: str, password: str, phone_number: str = None):
        if not self.is_valid_username(username):
            raise ValueError("Username must be at least 3 characters and contain only letters, numbers, _ or -")

        if not self.is_valid_email(email):
            raise ValueError("Invalid email format.")

        if phone_number and not self.is_valid_phone(phone_number):
            raise ValueError("Phone number must be 9-15 digits.")

        if not self.is_valid_password(password):
            raise ValueError(
                "Weak password. Must have at least 6 characters, "
                "1 uppercase, 1 lowercase, 1 number and 1 symbol."
            )

        response = self.supabase.auth.sign_up({
            "email": email,
            "password": password
        })

        if not response.user:
            raise Exception("Registration failed. Please try again.")

        profile_data = {
            "id": response.user.id,
            "username": username,
            "email": email,
            "phone_number": phone_number
        }
        self.supabase.table("profiles").insert(profile_data).execute()

        return {
            "user_id": response.user.id,
            "email": email,
            "username": username
        }

    # endregion Registration


    # ==========================================================
    # region Login
    # ==========================================================

    def login_user(self, identifier: str, password: str):
        email = identifier

        if not self.is_valid_email(identifier):
            user = (
                self.supabase.table("profiles")
                .select("email")
                .eq("username", identifier)
                .single()
                .execute()
            )
            if not user.data:
                raise ValueError("Username not found.")
            email = user.data["email"]

        response = self.supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        if not response.session:
            raise ValueError("Invalid email/username or password.")

        return {
            "access_token": response.session.access_token,
            "token_type": "bearer",
            "user": {
                "id": response.user.id,
                "email": response.user.email,
            }
        }

    # endregion Login
