from __future__ import annotations

import csv
import io
import sqlite3
from pathlib import Path
from typing import Any

from flask import Flask, Response, jsonify, request, send_from_directory

ROOT_DIR = Path(__file__).resolve().parent.parent
DB_PATH = Path(__file__).resolve().parent / "kazshin.db"
SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"

app = Flask(__name__, static_folder=str(ROOT_DIR), static_url_path="")

SEED_TIRES = [
    ("Michelin", "Primacy 4+", "Summer", "205/55 R16", "R16", 42000, 18, 4.8, 1),
    ("Nokian", "Hakkapeliitta R5", "Winter", "215/60 R17", "R17", 59000, 9, 4.9, 1),
    ("Bridgestone", "Blizzak Ice", "Winter", "205/60 R16", "R16", 52000, 6, 4.7, 0),
    ("Hankook", "Ventus Prime 4", "Summer", "225/45 R17", "R17", 45500, 22, 4.6, 0),
    ("Continental", "PremiumContact 7", "Summer", "235/45 R18", "R18", 63500, 11, 4.8, 1),
    ("Michelin", "CrossClimate 2", "All-season", "215/55 R17", "R17", 61000, 8, 4.7, 1),
    ("Bridgestone", "Weather Control A005", "All-season", "195/65 R15", "R15", 38000, 19, 4.5, 0),
    ("Nokian", "Nordman RS2", "Winter", "185/65 R15", "R15", 34500, 4, 4.4, 0),
    ("Hankook", "Kinergy 4S2", "All-season", "205/55 R16", "R16", 41000, 15, 4.6, 0),
    ("Continental", "WinterContact TS 870", "Winter", "225/50 R17", "R17", 67500, 7, 4.9, 1),
    ("Michelin", "Pilot Sport 5", "Summer", "235/40 R18", "R18", 72000, 5, 4.9, 0),
    ("Bridgestone", "Turanza T005", "Summer", "215/55 R16", "R16", 47000, 13, 4.5, 0),
    ("Hankook", "Winter i*cept RS3", "Winter", "195/65 R15", "R15", 36500, 10, 4.6, 0),
    ("Nokian", "Wetproof", "Summer", "205/55 R16", "R16", 39500, 20, 4.5, 0),
    ("Continental", "AllSeasonContact 2", "All-season", "225/45 R17", "R17", 58500, 6, 4.7, 1),
    ("Michelin", "X-Ice Snow", "Winter", "215/65 R16", "R16", 56000, 8, 4.8, 0),
    ("Bridgestone", "Potenza Sport", "Summer", "245/40 R18", "R18", 74500, 3, 4.7, 0),
    ("Hankook", "Dynapro HP2", "All-season", "225/65 R17", "R17", 54000, 12, 4.4, 0),
    ("Continental", "EcoContact 6", "Summer", "195/65 R15", "R15", 40500, 16, 4.6, 0),
    ("Nokian", "Snowproof 2", "Winter", "205/55 R16", "R16", 48500, 9, 4.7, 1),
    ("Michelin", "Latitude Sport 3", "Summer", "225/65 R17", "R17", 69000, 7, 4.8, 0),
]


def get_db() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    item = dict(row)
    if "recommended" in item:
        item["recommended"] = bool(item["recommended"])
    return item


def init_db() -> None:
    with get_db() as db:
        db.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
        count = db.execute("SELECT COUNT(*) AS total FROM tires").fetchone()["total"]
        if count == 0:
            db.executemany(
                """
                INSERT INTO tires
                (brand, model, season, size, rim, price, stock, rating, recommended)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                SEED_TIRES,
            )
        db.commit()


@app.after_request
def add_cors_headers(response: Response) -> Response:
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


@app.route("/")
def index() -> Response:
    return send_from_directory(ROOT_DIR, "index.html")


@app.route("/api/health")
def health() -> Response:
    return jsonify({"status": "ok", "service": "KazShin Tire Catalog API"})


@app.route("/api/tires")
def get_tires() -> Response:
    season = request.args.get("season", "all")
    brand = request.args.get("brand", "all")
    rim = request.args.get("rim", "all")
    stock = request.args.get("stock", "all")
    query = request.args.get("q", "").strip().lower()
    sort = request.args.get("sort", "recommended")

    sql = "SELECT * FROM tires WHERE 1=1"
    params: list[Any] = []

    if season != "all":
        sql += " AND season = ?"
        params.append(season)
    if brand != "all":
        sql += " AND brand = ?"
        params.append(brand)
    if rim != "all":
        sql += " AND rim = ?"
        params.append(rim)
    if stock == "available":
        sql += " AND stock > 7"
    elif stock == "low":
        sql += " AND stock <= 7"
    if query:
        sql += " AND lower(brand || ' ' || model || ' ' || size || ' ' || season || ' ' || rim) LIKE ?"
        params.append(f"%{query}%")

    sort_map = {
        "priceAsc": "price ASC",
        "priceDesc": "price DESC",
        "stockDesc": "stock DESC",
        "recommended": "recommended DESC, rating DESC",
    }
    sql += " ORDER BY " + sort_map.get(sort, sort_map["recommended"])

    with get_db() as db:
        rows = db.execute(sql, params).fetchall()

    return jsonify([row_to_dict(row) for row in rows])


@app.route("/api/tires/<int:tire_id>")
def get_tire(tire_id: int) -> Response:
    with get_db() as db:
        row = db.execute("SELECT * FROM tires WHERE id = ?", (tire_id,)).fetchone()
    if row is None:
        return jsonify({"error": "Tire not found"}), 404
    return jsonify(row_to_dict(row))


@app.route("/api/requests", methods=["GET"])
def get_requests() -> Response:
    with get_db() as db:
        rows = db.execute("SELECT * FROM customer_requests ORDER BY id DESC").fetchall()
    return jsonify([row_to_dict(row) for row in rows])


@app.route("/api/requests", methods=["POST", "OPTIONS"])
def create_request() -> Response:
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"})

    data = request.get_json(silent=True) or {}
    customer_name = str(data.get("customer_name", "")).strip()
    phone = str(data.get("phone", "")).strip()
    tire_size = str(data.get("tire_size", "")).strip()
    preferred_season = str(data.get("preferred_season", "")).strip()
    selected_tire = str(data.get("selected_tire", "")).strip()
    message = str(data.get("message", "")).strip()

    errors = []
    if len(customer_name) < 2:
        errors.append("Customer name must contain at least 2 characters.")
    if len(phone) < 7:
        errors.append("Phone number must contain at least 7 characters.")
    if len(tire_size) < 5:
        errors.append("Tire size is required, for example 205/55 R16.")
    if preferred_season not in {"Summer", "Winter", "All-season"}:
        errors.append("Preferred season must be Summer, Winter, or All-season.")

    if errors:
        return jsonify({"errors": errors}), 400

    with get_db() as db:
        cursor = db.execute(
            """
            INSERT INTO customer_requests
            (customer_name, phone, tire_size, preferred_season, selected_tire, message, status)
            VALUES (?, ?, ?, ?, ?, ?, 'New')
            """,
            (customer_name, phone, tire_size, preferred_season, selected_tire, message),
        )
        db.commit()
        new_id = cursor.lastrowid
        row = db.execute("SELECT * FROM customer_requests WHERE id = ?", (new_id,)).fetchone()

    return jsonify(row_to_dict(row)), 201


@app.route("/api/requests/export")
def export_requests() -> Response:
    with get_db() as db:
        rows = db.execute("SELECT * FROM customer_requests ORDER BY id DESC").fetchall()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Created At", "Customer Name", "Phone", "Tire Size", "Preferred Season", "Selected Tire", "Message", "Status"])
    for row in rows:
        writer.writerow([
            row["id"], row["created_at"], row["customer_name"], row["phone"], row["tire_size"],
            row["preferred_season"], row["selected_tire"], row["message"], row["status"],
        ])

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=kazshin_requests.csv"},
    )


if __name__ == "__main__":
    init_db()
    app.run(debug=True)
else:
    init_db()
