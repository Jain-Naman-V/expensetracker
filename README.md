# Expense Tracker

A minimal full-stack personal finance tool for recording and reviewing expenses.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm start
```
Backend runs on http://localhost:3001

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:5173

---

## 📁 Project Structure

```
├── backend/
│   ├── server.js         # Express server entry
│   ├── db.js             # PostgreSQL/TigerDB connection
│   └── routes/
│       └── expenses.js   # Expense API endpoints
│
├── frontend/
│   └── src/
│       ├── App.jsx       # Main application
│       ├── api/          # API layer
│       └── components/   # React components
```

---

## 🎯 Features

### Core Features (Implemented)
- ✅ Create expenses with amount, category, description, date
- ✅ View expense list sorted by date
- ✅ Filter by category
- ✅ Sort by date (newest/oldest first)
- ✅ Display total of visible expenses
- ✅ Idempotent submissions (handles retries/duplicates)
- ✅ Loading and error states
- ✅ Responsive design

### Nice-to-Have (Implemented)
- ✅ Input validation (positive amounts, required fields)
- ✅ Spending summary by category
- ✅ Modern, premium UI design

---

## 🔧 Key Design Decisions

### 1. Database: TigerDB (PostgreSQL/TimescaleDB)
**Why PostgreSQL?**
- ACID compliance for financial data integrity
- `DECIMAL(12,2)` type for precise money handling (no floating-point errors)
- Reliable cloud hosting with SSL encryption
- SQL for complex filtering/sorting queries

### 2. Idempotency for Network Reliability
**Problem:** Users may click submit multiple times or refresh after submitting.

**Solution:**
- Client generates unique `idempotencyKey` per form submission
- Server checks if key exists before creating expense
- Returns existing expense if duplicate detected
- Unique constraint prevents race conditions

```javascript
// Frontend generates key
const idempotencyKey = `${Date.now()}-${randomString}`;

// Backend checks before insert
const existing = await pool.query(
  'SELECT * FROM expenses WHERE idempotency_key = $1', [key]
);
```

### 3. Money as DECIMAL, Not Float
```sql
amount DECIMAL(12,2) NOT NULL  -- Up to 10B with 2 decimal places
```
Floats cause rounding errors (`0.1 + 0.2 ≠ 0.3`). DECIMAL is exact.

### 4. Server-Side Filtering/Sorting
Filtering and sorting happen in the database, not in JavaScript:
- More efficient for large datasets
- Consistent behavior regardless of client
- Proper use of database indexes

---

## ⚖️ Trade-offs (Due to Timebox)

| Included | Excluded |
|----------|----------|
| Core CRUD operations | User authentication |
| Idempotency for retries | Edit/delete expenses |
| Basic validation | Advanced analytics |
| Category filter & date sort | Date range filtering |
| Error/loading states | Pagination |
| Category summary | Complex charts/graphs |

---

## 🚫 Intentionally Not Done

1. **Authentication** - No user login; assumes single-user local use
2. **Edit/Delete** - Focus on create & read for MVP
3. **Pagination** - Loads all expenses; fine for personal use
4. **Date Range Filter** - Single category filter prioritized
5. **Test Suite** - Prioritized working features over test coverage

---

## 🔌 API Reference

### POST /expenses
Create a new expense.

```json
// Request
{
  "amount": 499.99,
  "category": "Food & Dining",
  "description": "Dinner at restaurant",
  "date": "2026-02-03",
  "idempotencyKey": "1706976000000-abc123"
}

// Response
{
  "expense": { "id": "...", "amount": "499.99", ... },
  "duplicate": false
}
```

### GET /expenses
List expenses with optional filters.

| Param | Description |
|-------|-------------|
| `category` | Filter by exact category name |
| `sort` | `date_desc` (default) or `date_asc` |

```json
// Response
{
  "expenses": [...],
  "total": "1499.97",
  "count": 3
}
```

### GET /expenses/categories
Get unique categories.

### GET /expenses/summary
Get spending totals grouped by category.

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express, PostgreSQL (TigerDB)
- **Frontend:** React 18, Vite
- **Styling:** Vanilla CSS with CSS Variables
- **Database:** TigerDB Cloud (TimescaleDB/PostgreSQL)

---

## 🚀 Deployment Guide (Vercel)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: Expense Tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/expense-tracker.git
git push -u origin main
```

### Step 2: Deploy Backend to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your repository
4. Configure:
   - **Root Directory:** `backend`
   - **Framework Preset:** Other
5. Add Environment Variable:
   - `DATABASE_URL` = `postgres://tsdbadmin:tk09dp8w9o0mu9ah@fpdm5zid41.f48kujtaeb.tsdb.cloud.timescale.com:32243/tsdb?sslmode=require`
6. Click **Deploy**
7. Copy the deployed URL (e.g., `https://expense-tracker-backend.vercel.app`)

### Step 3: Deploy Frontend to Vercel
1. Click **"Add New Project"** again
2. Import the same repository
3. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
4. Add Environment Variable:
   - `VITE_API_URL` = `https://YOUR-BACKEND-URL.vercel.app` (from Step 2)
5. Click **Deploy**

### Step 4: Verify
- Visit your frontend URL
- Add an expense and verify it appears in the list
- Test filtering and sorting

---

## 📝 License

MIT
