from flask import Flask, jsonify, render_template
from flask_cors import CORS
from models import db, Application, Listing
from routes.applications import applications_bp
from routes.listings import listings_bp
import os

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///job_tracker.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    CORS(app)  # kept for flexibility, though not strictly needed once frontend/backend share an origin

    app.register_blueprint(applications_bp, url_prefix="/api/applications")
    app.register_blueprint(listings_bp, url_prefix="/api")

    with app.app_context():
        db.create_all()

    @app.route("/")
    def index():
        return render_template("index.html")

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok"})

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)