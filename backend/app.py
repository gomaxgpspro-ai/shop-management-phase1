from flask import Flask, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-only-change-this-key")
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173"]}})

@app.get("/api/health")
def health():
    """Basic health check. No database or business logic in Phase 1."""
    return jsonify({
        "status": "ok",
        "message": "Shop Management System API is running",
        "phase": 1
    })

@app.get("/")
def index():
    return jsonify({
        "app": "Shop Management System",
        "backend": "Python Flask",
        "phase": 1,
        "note": "UI scaffold only; modules and database are not connected yet."
    })

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
