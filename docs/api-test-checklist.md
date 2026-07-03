# API Testing Checklist

Use these tests as evidence for the final report and presentation.

## 1. Health Check

Open in browser:

```text
http://127.0.0.1:5000/api/health
```

Expected result:

```json
{"service":"KazShin Tire Catalog API","status":"ok"}
```

## 2. Tire Catalog API

Open:

```text
http://127.0.0.1:5000/api/tires
```

Expected result: list of tire products from the SQLite database.

## 3. Filtered Tire API

Open:

```text
http://127.0.0.1:5000/api/tires?season=Winter&rim=R16
```

Expected result: only winter tires with R16 rim size.

## 4. Customer Request API

In PowerShell:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/requests" -Method POST -ContentType "application/json" -Body '{"customer_name":"Test Customer","phone":"+77770000000","tire_size":"205/55 R16","preferred_season":"Winter","selected_tire":"Nokian Snowproof 2","message":"Please check availability"}'
```

Expected result: new request object with id and created_at.

## 5. Saved Requests API

Open:

```text
http://127.0.0.1:5000/api/requests
```

Expected result: list of saved customer requests.

## 6. CSV Export

Open:

```text
http://127.0.0.1:5000/api/requests/export
```

Expected result: CSV file download.
