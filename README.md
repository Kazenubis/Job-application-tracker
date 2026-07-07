# Job Trail — Job Application Tracker

A full-stack Kanban-style tracker for your own job search, with a built-in scraper
that pulls fresh Python job listings from [RemoteOK](https://remoteok.com) so you
can save them straight into your pipeline.

![Status](https://img.shields.io/badge/status-active-brightgreen)

## Features

- **Kanban board** — drag applications between Applied → Interview → Offer → Rejected
- **Discover panel** — pulls live Python job listings from RemoteOK's public API
- **One-click save** — turn a discovered listing into a tracked application
- **Notes & details** — track interviewer notes, listing links, and status per application
- **REST API** — clean Flask backend, no page reloads on the frontend

## Tech Stack

**Backend**: Python, Flask, Flask-SQLAlchemy, Flask-CORS, SQLite
**Frontend**: HTML, CSS, vanilla JavaScript (fetch API, native drag-and-drop)

## Project Structure

```
job-tracker/
├── backend/
│   ├── app.py                  # Flask app entry point
│   ├── models.py                # SQLAlchemy models (Application, Listing)
│   ├── routes/
│   │   ├── applications.py     # CRUD routes for tracked applications
│   │   └── listings.py         # Scraper + listings routes
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
└── README.md
```

## Setup & Run

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
python app.py
```

Backend runs at `http://localhost:5000`. The SQLite database (`job_tracker.db`)
is created automatically on first run.

### Frontend

The frontend is plain HTML/CSS/JS — no build step needed. Open `frontend/index.html`
directly in your browser, or serve it locally:

```bash
cd frontend
python -m http.server 5500
```

Then visit `http://localhost:5500`.

> Make sure the backend is running first — the frontend calls `http://localhost:5000/api`.

## API Reference

| Method | Route | Description |
|---|---|---|
| GET | `/api/applications` | List all tracked applications |
| POST | `/api/applications` | Create a new application |
| PATCH | `/api/applications/<id>` | Update status or notes |
| DELETE | `/api/applications/<id>` | Remove an application |
| GET | `/api/listings` | List scraped job listings |
| POST | `/api/scrape` | Pull fresh listings from RemoteOK |

## Why this project

Built while job hunting for Junior Python Developer roles — it tracks my own
applications and pulls in relevant listings so I don't lose track of where
I've applied or miss new postings.
