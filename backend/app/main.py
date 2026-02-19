from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, accounts, transactions, budgets, budgets

app = FastAPI(
    title="Finance Control API",
    version="1.0.0"
)

# ==========================================================
# CORS — allows React (localhost:5173) to call the API
# ==========================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://finance-control-v1-ten.vercel.app",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================
# Routers
# ==========================================================
app.include_router(auth.router)
app.include_router(accounts.router)
app.include_router(transactions.router)
app.include_router(budgets.router)
app.include_router(budgets.router)


@app.get("/")
def root():
    return {"message": "Finance Control API is running"}