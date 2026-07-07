from flask import Blueprint, request, jsonify
from models import db, Application, VALID_STATUSES

applications_bp = Blueprint("applications", __name__)


@applications_bp.route("", methods=["GET"])
def get_applications():
    applications = Application.query.order_by(Application.date_applied.desc()).all()
    return jsonify([a.to_dict() for a in applications])


@applications_bp.route("", methods=["POST"])
def create_application():
    data = request.get_json(silent=True) or {}

    company = data.get("company")
    role = data.get("role")

    if not company or not role:
        return jsonify({"error": "company and role are required"}), 400

    application = Application(
        company=company,
        role=role,
        status=data.get("status", "Applied"),
        notes=data.get("notes", ""),
        listing_url=data.get("listing_url", ""),
    )
    db.session.add(application)
    db.session.commit()

    return jsonify(application.to_dict()), 201


@applications_bp.route("/<int:app_id>", methods=["PATCH"])
def update_application(app_id):
    application = Application.query.get(app_id)
    if not application:
        return jsonify({"error": "Application not found"}), 404

    data = request.get_json(silent=True) or {}

    if "status" in data:
        if data["status"] not in VALID_STATUSES:
            return jsonify({"error": f"status must be one of {VALID_STATUSES}"}), 400
        application.status = data["status"]

    if "notes" in data:
        application.notes = data["notes"]

    if "company" in data:
        application.company = data["company"]

    if "role" in data:
        application.role = data["role"]

    db.session.commit()
    return jsonify(application.to_dict())


@applications_bp.route("/<int:app_id>", methods=["DELETE"])
def delete_application(app_id):
    application = Application.query.get(app_id)
    if not application:
        return jsonify({"error": "Application not found"}), 404

    db.session.delete(application)
    db.session.commit()
    return jsonify({"deleted": app_id})
