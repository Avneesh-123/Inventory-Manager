# Inventory & Order Management System

Production-ready full-stack application for managing products, customers, orders, and inventory tracking.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python, FastAPI, SQLAlchemy |
| Frontend | React (Vite), React Router |
| Database | PostgreSQL |
| Containers | Docker, Docker Compose |

## Features

- **Products** — CRUD with unique SKU, non-negative stock
- **Customers** — Create, list, view, delete with unique email
- **Orders** — Create with automatic total calculation and stock deduction; cancel restores inventory
- **Dashboard** — Totals and low-stock alerts (≤ 10 units by default)
- **Validation** — Pydantic schemas, proper HTTP status codes, clear API errors

## Quick Start (Docker Compose)

```bash
cp .env.example .env
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export DATABASE_URL=postgresql://inventory:inventory@localhost:5432/inventory_db
export CORS_ORIGINS=http://localhost:5173
uvicorn app.main:app --reload --port 8000
```

Start PostgreSQL locally or run only the database container:

```bash
docker compose up db -d
```

### Frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

Open http://localhost:5173

## API Endpoints

### Products
| Method | Path | Description |
|--------|------|-------------|
| POST | `/products` | Create product |
| GET | `/products` | List products |
| GET | `/products/{id}` | Get product |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |

### Customers
| Method | Path | Description |
|--------|------|-------------|
| POST | `/customers` | Create customer |
| GET | `/customers` | List customers |
| GET | `/customers/{id}` | Get customer |
| DELETE | `/customers/{id}` | Delete customer |

### Orders
| Method | Path | Description |
|--------|------|-------------|
| POST | `/orders` | Create order (reduces stock) |
| GET | `/orders` | List orders |
| GET | `/orders/{id}` | Order details |
| DELETE | `/orders/{id}` | Cancel order (restores stock) |

### Dashboard
| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard/stats` | Summary metrics |

## Business Rules

1. Product SKU must be unique
2. Customer email must be unique
3. Stock quantity cannot be negative
4. Orders rejected when stock is insufficient
5. Order creation automatically reduces inventory
6. Order total calculated by backend from product prices × quantities

## Docker Hub (Backend Image)

Build and push the backend image for submission:

```bash
docker build -t YOUR_DOCKERHUB_USERNAME/inventory-backend:latest ./backend
docker push YOUR_DOCKERHUB_USERNAME/inventory-backend:latest
```

## Deployment

### Backend (Render / Railway / Fly.io)

1. Deploy the `backend` folder as a web service
2. Add a PostgreSQL database (managed Postgres)
3. Set environment variables:
   - `DATABASE_URL` — Postgres connection string from host
   - `CORS_ORIGINS` — Your frontend URL (e.g. `https://your-app.vercel.app`)
   - `LOW_STOCK_THRESHOLD` — Optional (default `10`)
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Render example:** New Web Service → Connect repo → Root directory `backend` → Add Postgres → set `DATABASE_URL` and `CORS_ORIGINS`.

### Frontend (Vercel / Netlify)

1. Deploy the `frontend` folder
2. Set build environment variable:
   - `VITE_API_URL` — Your deployed backend URL (e.g. `https://your-api.onrender.com`)
3. Build command: `npm run build`
4. Output directory: `dist`

**Vercel:** Import repo → Root `frontend` → Framework Vite → add `VITE_API_URL` → Deploy.

After deployment, update backend `CORS_ORIGINS` to include the live frontend URL.

## Submission Checklist

- [ ] GitHub repository with frontend + backend code
- [ ] Docker Hub link for backend image
- [ ] Live frontend URL (Vercel/Netlify)
- [ ] Live backend API URL (Render/Railway/Fly.io)

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── database.py
│   │   ├── config.py
│   │   └── routers/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── api/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── .env.example
```

## License

MIT — for assessment submission.
