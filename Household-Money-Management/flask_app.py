from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import requests
from datetime import datetime

app = Flask(__name__)
CORS(app)  # CORS is used for communication with React

# database.db is mainly a placeholder name, it can be updated to whatever is required
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"  # using SQLite here, but could easily use
# PostgreSQL, etc. if necessary
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)  # initializing the database for API communication

class User(db.Model):
    # database schema
    user_id = db.Column(db.Integer, primary_key = True)
    user_first_name = db.Column(db.String(80), nullable = False)
    user_last_name = db.Column(db.String(80), nullable = False)

# creating tables to be ready for receiving requests
with app.app_context():
    db.create_all()

# method that populates the database with user info (first name, last name)
@app.route("/add_user", methods = ["POST"])
def add_user():
    # user data fields are placeholder as well, they can be updated/modified as needed4
    user_data = request.json
    user_first_name = user_data.get("first_name")
    user_last_name = user_data.get("last_name")
    # denies data addition if the fields are not present
    if not user_first_name or user_last_name:
        return jsonify({"error" : "Missing required fields"}), 400

    # successfully adds data entries to the database if provided data is valid
    new_user = User(user_first_name = user_first_name, user_last_name = user_last_name)
    db.session.add(new_user)
    db.session.commit()

    # returns message that data addition is successful
    return jsonify({"message" : "User successfully added"}), 201

@app.route("/users", methods = ["GET"])
def get_users():
    users = User.query.all()
    # returns a list of all data received from the user/database
    return jsonify([{"user_id" : user.user_id, "user_first_name" : user.user_first_name,
                     "user_last_name" : user.user_last_name, } for user in users])



class ConversionHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    from_currency = db.Column(db.String(10), nullable=False)
    to_currency = db.Column(db.String(10), nullable=False)
    result = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

with app.app_context():
    db.create_all()

@app.route("/convert", methods=["POST"])
def convert_currency():
    data = request.json
    amount = data.get("amount")
    from_currency = data.get("from")
    to_currency = data.get("to")

    if not all([amount, from_currency, to_currency]):
        return jsonify({"error": "Missing required fields"}), 400

    if from_currency == to_currency:
        result = float(amount)
    else:
        try:
            response = requests.get("https://api.frankfurter.app/latest", params={
                "amount": amount,
                "from": from_currency,
                "to": to_currency
            })
            response.raise_for_status()
            result = response.json()["rates"][to_currency]
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    conversion = ConversionHistory(
        amount=amount,
        from_currency=from_currency,
        to_currency=to_currency,
        result=result
    )
    db.session.add(conversion)
    db.session.commit()

    return jsonify({"converted_amount": result})

@app.route("/conversion_history", methods=["GET"])
def get_conversion_history():
    history = ConversionHistory.query.order_by(ConversionHistory.timestamp.desc()).limit(10).all()
    return jsonify([
        {
            "amount": h.amount,
            "from_currency": h.from_currency,
            "to_currency": h.to_currency,
            "result": h.result,
            "timestamp": h.timestamp.isoformat()
        } for h in history
    ])

if __name__ == "__main__":
    app.run()
