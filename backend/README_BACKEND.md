# KazShin Backend API

This backend adds deeper technical implementation to the KazShin Tire Catalog system.
It uses Python Flask, SQLite and REST API endpoints.

## How to Run

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Open the website:

```text
http://127.0.0.1:5000/
```

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check that the backend is running |
| GET | `/api/tires` | Get all tire products from SQLite |
| GET | `/api/tires?season=Winter&brand=Nokian` | Filter tire products |
| GET | `/api/tires/<id>` | Get one tire by ID |
| POST | `/api/requests` | Save a customer request to SQLite |
| GET | `/api/requests` | Show all saved customer requests |
| GET | `/api/requests/export` | Export customer requests as CSV |

## Database Tables

### tires
- id
- brand
- model
- season
- size
- rim
- price
- stock
- rating
- recommended

### customer_requests
- id
- customer_name
- phone
- tire_size
- preferred_season
- selected_tire
- message
- status
- created_at
