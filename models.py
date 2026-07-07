from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

VALID_STATUSES = ["Applied", "Interview", "Offer", "Rejected"]


class Application(db.Model):
    __tablename__ = "applications"

    id = db.Column(db.Integer, primary_key=True)
    company = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(20), nullable=False, default="Applied")
    date_applied = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text, nullable=True)
    listing_url = db.Column(db.String(500), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "company": self.company,
            "role": self.role,
            "status": self.status,
            "date_applied": self.date_applied.strftime("%Y-%m-%d") if self.date_applied else None,
            "notes": self.notes or "",
            "listing_url": self.listing_url or "",
        }


class Listing(db.Model):
    __tablename__ = "listings"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    company = db.Column(db.String(200), nullable=False)
    url = db.Column(db.String(500), nullable=False)
    tags = db.Column(db.String(300), nullable=True)
    source = db.Column(db.String(50), default="RemoteOK")
    date_scraped = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "company": self.company,
            "url": self.url,
            "tags": self.tags or "",
            "source": self.source,
            "date_scraped": self.date_scraped.strftime("%Y-%m-%d") if self.date_scraped else None,
        }
