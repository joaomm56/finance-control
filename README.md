# 💰 FinControl — Personal Finance Manager

> A full-stack personal finance web application built with React and FastAPI, featuring real-time budget tracking, savings goals, investment predictions powered by AI, and interactive charts.

---

## 🚀 Features

### 📊 Dashboard & Overview
- Real-time balance across multiple accounts
- Monthly income vs expenses summary
- Last 7 days and last 6 months trend charts
- Expense breakdown by category (pie chart)

### 🏦 Account Management
- Create and manage multiple accounts (Current, Saving, Investment)
- Per-account transaction history with detailed charts
- Transfers between accounts

### 💳 Transactions
- Create income, expense and transfer transactions
- Filter transactions by month
- Grouped by day with daily summaries
- Edit and delete with automatic balance recalculation (via Supabase DB triggers)

### 📈 Budgets
- Set monthly spending limits per category
- Visual progress bars with overspend alerts
- Real-time tracking against actual expenses

### 🎯 Savings Goals
- Create goals with target amount, deadline and progress tracking
- Visual progress indicators
- Automatic completion detection

### 📉 Reports & Charts
- Weekly, monthly and annual financial reports
- Switchable chart types: Line, Bar, Area
- Net balance trend over time
- Category breakdown per period

### 🔮 AI Investment Predictions
- Stock and crypto forecasting using **NeuralProphet**
- Supports any ticker (AAPL, NVDA, BTC-USD, ETH-USD...)
- Configurable historical data range and forecast horizon
- Model metrics: R² Score, MAE, MAPE

### 🏷️ Custom Categories
- Create custom expense/income categories with icons and colors
- Fully integrated into transaction creation

### 🛠️ Tools
- Export transactions to **CSV**
- Full backup to **JSON**
- Data summary stats

---

## 🛠️ Tech Stack

### Frontend
| Tech | Usage |
|------|-------|
| **React 18** | UI framework |
| **Vite** | Build tool |
| **Recharts** | Charts and data visualization |
| **React Router** | Client-side routing |

### Backend
| Tech | Usage |
|------|-------|
| **FastAPI** | REST API |
| **Python** | Business logic & services |
| **Supabase** | PostgreSQL database + Auth |
| **NeuralProphet** | AI time-series forecasting |
| **yFinance** | Stock & crypto market data |

### Infrastructure
| Tech | Usage |
|------|-------|
| **Supabase** | Database, authentication, row-level security |
| **DB Triggers** | Automatic balance updates on transaction create/delete |
| **JWT** | Secure token-based authentication |

---

## 🗄️ Architecture

```
fincontrol/
├── frontend/                  # React + Vite
│   ├── src/
│   │   ├── api/               # API client (accounts, transactions, budgets)
│   │   ├── pages/
│   │   │   └── Dashboard.jsx  # Main app (all tabs)
│   │   └── main.jsx
│   └── vite.config.js
│
└── backend/                   # FastAPI
    └── app/
        ├── routers/           # Endpoints (accounts, transactions, budgets, predict)
        ├── services/          # Business logic layer
        ├── dependencies.py    # JWT auth middleware
        └── database.py        # Supabase client
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Supabase account

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Environment Variables
```env
# backend/.env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
```

---

## 📱 Responsive Design

Fully responsive — works on desktop and mobile with a dedicated bottom navigation bar on small screens.

---

## 🔐 Security

- JWT authentication on all protected endpoints
- Row-Level Security (RLS) via Supabase — users only access their own data
- Ownership validation on every transaction and account operation

---


## 👨‍💻 Author

Built from scratch as a personal project to deepen full-stack skills across React, FastAPI, PostgreSQL and machine learning integration.

---
