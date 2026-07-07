import requests
from flask import Blueprint, jsonify
from models import db, Listing

listings_bp = Blueprint("listings", __name__)

REMOTEOK_API = "https://remoteok.com/api"


@listings_bp.route("/listings", methods=["GET"])
def get_listings():
    listings = Listing.query.order_by(Listing.date_scraped.desc()).limit(50).all()
    return jsonify([l.to_dict() for l in listings])


@listings_bp.route("/scrape", methods=["POST"])
def scrape_listings():
    """Pull fresh listings from RemoteOK's public API and store new ones."""
    headers = {"User-Agent": "Mozilla/5.0 (job-tracker educational project)"}

    try:
        response = requests.get(REMOTEOK_API, headers=headers, timeout=10)
    except requests.RequestException as e:
        return jsonify({"error": f"Could not reach RemoteOK: {e}"}), 502

    if response.status_code != 200:
        return jsonify({"error": f"RemoteOK returned {response.status_code}"}), 502

    data = response.json()

    # RemoteOK's first array item is a legal notice, not a job — skip it
    jobs = [item for item in data if isinstance(item, dict) and item.get("id")]

    # only keep python-relevant roles
    python_jobs = [
        job for job in jobs
        if "python" in (job.get("position", "") + " " + " ".join(job.get("tags", []))).lower()
    ]

    added = 0
    for job in python_jobs[:30]:  # cap per scrape to keep it manageable
        job_id = str(job.get("id"))
        exists = Listing.query.filter_by(url=job.get("url")).first()
        if exists:
            continue

        listing = Listing(
            title=job.get("position", "Untitled"),
            company=job.get("company", "Unknown"),
            url=job.get("url", ""),
            tags=", ".join(job.get("tags", [])[:5]),
            source="RemoteOK",
        )
        db.session.add(listing)
        added += 1

    db.session.commit()
    return jsonify({"added": added, "total_checked": len(python_jobs)})


@listings_bp.route("/listings/<int:listing_id>", methods=["DELETE"])
def delete_listing(listing_id):
    listing = Listing.query.get(listing_id)
    if not listing:
        return jsonify({"error": "Listing not found"}), 404
    db.session.delete(listing)
    db.session.commit()
    return jsonify({"deleted": listing_id})
