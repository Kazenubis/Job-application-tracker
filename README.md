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
- **REST API** — clean Flask backend serving both the API and the frontend

## Tech Stack

**Backend**: Python, Flask, Flask-SQLAlchemy, Flask-CORS, SQLite
**Frontend**: HTML, CSS, vanilla JavaScript (fetch API, native drag-and-drop)

## Project Structure

```
job-tracker/
├── app.py                      # Flask app entry point (serves API + frontend)
├── models.py                    # SQLAlchemy models (Application, Listing)
├── routes/
│   ├── applications.py         # CRUD routes for tracked applications
│   └── listings.py             # Scraper + listings routes
├── static/
│   ├── style.css
│   └── app.js
├── templates/
│   └── index.html
├── requirements.txt
└── README.md
```

## Setup & Run

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
python app.py
```

Then open your browser to:

```
http://127.0.0.1:5000/
```

The SQLite database (`job_tracker.db`) is created automatically on first run.
Everything — API and frontend — runs from this single command.

## API Reference

| Method | Route | Description |
|---|---|---|
| GET | `/api/applications` | List all tracked applications |
| POST | `/api/applications` | Create a new application |
| PATCH | `/api/applications/<id>` | Update status or notes |
| DELETE | `/api/applications/<id>` | Remove an application |
| GET | `/api/listings` | List scraped job listings |
| POST | `/api/scrape` | Pull fresh Python listings from RemoteOK |

## Why this project

Built while job hunting for Junior Python Developer roles — it tracks my own
applications and pulls in relevant Python listings so I don't lose track of
where I've applied or miss new postings.
