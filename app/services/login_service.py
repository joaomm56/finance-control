import re
from database import supabase

# Functions to check email and password before sending to Supabase, and to handle registration and login with clear messages.

def is_valid_email(email):
    # Check if the email has a valid format using regex before sending to Supabase.
    default = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'   # Regex Formula to check if the email is valid
    return re.match(default, email) is not None                     # Returns True if the email is valid, False otherwise.

def get_user_credentials():
    # ask for email and password, with validation for email format, before sending to Supabase.
    while True:
        email = input("Email: ").strip()
        if is_valid_email(email):
            break   # If the email is valid, exit the loop
        print("Error: Invalid email format. Please enter a valid email address.")
    
    password = input("Password: ")
    return email, password

# Supabase registration and login functions with error handling to provide clear feedback to the user.
def register_user(email, password):
    # try to register the user with Supabase 
    try:
        response = supabase.auth.sign_up({
            "email": email, 
            "password": password
        })
        
        if response.user:
            print("User registered successfully!")
            return response
            
    except Exception as e:
        error_msg = str(e)
        # checking for specific error messages to provide more user-friendly feedback.
        if "at least 6 characters" in error_msg:
            print("Error: The password must be at least 6 characters long.")
        elif "one character of each" in error_msg:
            print("Error: The password must contain uppercase, lowercase, numbers and symbols.")
        elif "already registered" in error_msg:
            print("Error: This email is already in use.")
        else:
            print(f"Error registering user: {error_msg}")
        return None

def login_user(email, password):
    # try to log in the user with Supabase and handle errors to provide clear feedback.
    try:
        response = supabase.auth.sign_in_with_password({
            "email": email, 
            "password": password
        })
        if response.session:
            print(f"Login successful,Welcome {email}.")
            return response.session
    except Exception as e:
        error_msg = str(e)
        if "Invalid login credentials" in error_msg:
            print("Error: Invalid email or password.")
        else:
            print(f"Error during login: {error_msg}")
        return None