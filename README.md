# KazShin Tire Catalog and Customer Request Management Website

KazShin Tire Catalog is a web-based tire catalog and customer request management website for a tire sales company.

Customers can browse tire models, filter products by season, brand, rim size and availability, select a tire, and submit an online request for consultation or purchase.

## Main Features

- Modern responsive landing page
- Tire catalog with product cards
- Search by brand, model, season and size
- Filters by season, brand, rim size and availability
- Product details modal window
- Customer request form
- Incoming customer requests table
- Export requests to CSV

## Technologies Used

- HTML
- CSS
- JavaScript
- localStorage
- Git
- GitHub Pages

## Website Sections

- Home page
- Tire catalog
- Services
- Delivery and payment
- Customer request form
- Incoming customer requests
- About KazShin
- Contacts
- FAQ

## Technical Contribution

The main technical contribution is the implementation of an interactive catalog and request-management workflow using JavaScript.

Product data is represented as JavaScript objects and rendered dynamically as catalog cards. The system includes filtering, sorting, modal product selection, form validation, localStorage persistence, and CSV export.

## How to Run

Open `index.html` in a browser.

## Project Structure

```text
kazshin-tire-catalog/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── docs/
│   ├── calendar-plan.md
│   ├── company-characteristic-template.md
│   └── report-text.md
└── README.md
```

## Backend Extension

The project also includes a backend API to strengthen the technical implementation.

Backend technologies:

- Python
- Flask
- SQLite
- REST API
- SQL database schema

Backend folder:

```text
backend/
├── app.py
├── schema.sql
├── requirements.txt
└── README_BACKEND.md
```

The backend provides API endpoints for tire products and customer requests. Customer requests are saved into a SQLite database instead of only browser localStorage when the project is launched through Flask.

Run backend:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Then open:

```text
http://127.0.0.1:5000/
```
