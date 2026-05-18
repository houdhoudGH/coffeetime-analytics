from flask import Flask, request, redirect, send_from_directory, jsonify, session
import os
from datetime import datetime
import csv
import json
import requests
from dotenv import load_dotenv
from flask_cors import CORS


class SimpleConversationMemory:
    def __init__(self):
        self.history = []
    
    def add_message(self, user_input, bot_output):
        self.history.append(f"User: {user_input}")
        self.history.append(f"Assistant: {bot_output}")
        if len(self.history) > 20:
            self.history = self.history[-20:]
    
    def get_history(self):
        return "\n".join(self.history) if self.history else "No previous conversation"
    
    def clear(self):
        self.history = []


memory = SimpleConversationMemory()

load_dotenv()
app = Flask(__name__)
app.secret_key = "coffeetime_secret_key_123" 
CORS(app)

HF_API_KEY = os.getenv("HF_API_TOKEN")
HF_MODEL_ID = os.getenv("HF_MODEL_ID", "meta-llama/Llama-3.1-8B-Instruct")
HF_URL = "https://router.huggingface.co/v1/chat/completions"


os.makedirs("static/qa", exist_ok=True)
qa_file = "static/qa/messages.txt"


def load_coffee_data():
    """Load and process the coffee sales data from CSV"""
    data = []
    try:
        with open("data/raw/index_1.csv", "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                data.append({
                    "date": row["date"],
                    "datetime": row["datetime"],
                    "cash_type": row["cash_type"],
                    "money": float(row["money"]),
                    "coffee_name": row["coffee_name"]
                })
    except Exception as e:
        print(f"Error loading data: {e}")
    return data


def aggregate_data(data, group_by="monthly"):
    """Aggregate data by different time periods"""
    aggregated = {}
    
    for row in data:
        date_str = row["date"]
        
        if group_by == "monthly":
            key = date_str[:7]  
        elif group_by == "daily":
            key = date_str
        elif group_by == "hourly":
            dt = row["datetime"]
            hour = dt.split(" ")[1].split(":")[0] if " " in dt else "00"
            key = hour
        else:
            key = date_str
        
        if key not in aggregated:
            aggregated[key] = {"total_sales": 0, "count": 0, "by_type": {}}
        
        aggregated[key]["total_sales"] += row["money"]
        aggregated[key]["count"] += 1
        
        coffee_type = row["coffee_name"]
        if coffee_type not in aggregated[key]["by_type"]:
            aggregated[key]["by_type"][coffee_type] = {"total": 0, "count": 0}
        aggregated[key]["by_type"][coffee_type]["total"] += row["money"]
        aggregated[key]["by_type"][coffee_type]["count"] += 1
    
    return aggregated


def get_forecast_data(monthly_data):
    """Simple linear forecast for the next 3 months"""
    labels = sorted(monthly_data.keys())
    values = [monthly_data[k]["total_sales"] for k in labels]
    
    if len(values) < 2:
        return []
    
    
    n = len(values)
    x_mean = (n - 1) / 2
    y_mean = sum(values) / n
    
    numerator = sum((i - x_mean) * (values[i] - y_mean) for i in range(n))
    denominator = sum((i - x_mean) ** 2 for i in range(n))
    
    slope = numerator / denominator if denominator != 0 else 0
    intercept = y_mean - slope * x_mean
    
    
    forecast = []
    last_month = labels[-1]
    year, month = int(last_month[:4]), int(last_month[5:7])
    
    for i in range(1, 4):
        month += 1
        if month > 12:
            month = 1
            year += 1
        forecast_month = f"{year}-{month:02d}"
        predicted_value = intercept + slope * (n + i - 1)
        forecast.append({
            "month": forecast_month,
            "predicted_sales": max(0, round(predicted_value, 2))
        })
    
    return forecast


@app.route("/")
def index():
    return send_from_directory(".", "index.html")


@app.route("/eda")
def eda():
    return send_from_directory(".", "eda.html")


@app.route("/modeling")
def modeling():
    return send_from_directory(".", "modeling.html")


@app.route("/question", methods=["GET", "POST"])
def question():
    if request.method == "POST":
        name = request.form.get("name", "Anonymous")
        message = request.form.get("message", "")
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        with open(qa_file, "a", encoding="utf-8") as f:
            f.write(f"\n----\nName: {name}\nMessage: {message}\nDate: {timestamp}\n")
        return redirect("/question?success=1")
    return send_from_directory(".", "question.html")


def get_data_context():
    """Build a professional text summary of the current data for the chatbot"""
    try:
        raw_data = load_coffee_data()
        monthly = aggregate_data(raw_data, "monthly")
        
        total_rev = round(sum(d["money"] for d in raw_data), 2)
        total_trans = len(raw_data)
        months = sorted(monthly.keys())
        latest_month = months[-1] if months else "N/A"
        latest_sales = round(monthly[latest_month]["total_sales"], 2) if latest_month != "N/A" else 0
        
        types = {}
        for d in raw_data:
            t = d["coffee_name"]
            types[t] = types.get(t, 0) + d["money"]
        top_coffee = max(types, key=types.get) if types else "N/A"
        
        return (
            f"Real-time Data Insights: Our total platform revenue stands at ${total_rev} from {total_trans} transactions. "
            f"The current market leader in our data is {top_coffee}. "
            f"For {latest_month}, we observed a strong performance of ${latest_sales} in sales."
        )
    except Exception:
        return "Data insights are currently being refreshed."


def query_huggingface(message, data_context="", greeted=False):
    """Query Hugging Face Inference API with personality and data awareness"""
    if not HF_API_KEY or "your_token" in HF_API_KEY:
        return "I'm currently in quiet mode. Please add my voice (API token) to help me speak! ☕"

    
    chat_history = memory.get_history()

    headers = {
        "Authorization": f"Bearer {HF_API_KEY}",
        "Content-Type": "application/json"
    }

    system_instr = f"""
You are Alaa, the AI customer support assistant for CoffeeTime Analytics.

CONVERSATION HISTORY:
{chat_history}

RULES:
- Be brief, clear, and helpful.
- Do not repeat greetings.
- Use the conversation history to understand context.

WEBSITE STRUCTURE:
- Home
- EDA
- Modeling
- Questions

DATA CONTEXT:
{data_context}
"""
    
    payload = {
        "model": HF_MODEL_ID,
        "messages": [
            {"role": "system", "content": system_instr},
            {"role": "user", "content": message}
        ],
        "max_tokens": 150,
        "temperature": 0.4
    }
    
    try:
        response = requests.post(HF_URL, headers=headers, json=payload, timeout=20)
        
        
        print(f"DEBUG: HF API Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"DEBUG: HF API Error Body: {response.text}")
            return f"I couldn't reach the model right now (Error {response.status_code}). Please try again in a bit! ☕"
            
        try:
            result = response.json()
        except ValueError:
            print(f"DEBUG: Failed to parse JSON. Raw body: {response.text}")
            return "I got a bit dizzy... can you say that again? ☕"
        
        if "choices" in result and len(result["choices"]) > 0:
            bot_text = result["choices"][0]["message"].get("content", "")
            
            
            memory.add_message(message, bot_text)
            
        elif isinstance(result, dict) and "error" in result:
            return f"Thinking error: {result['error']}"
        
        return bot_text or "I heard you, but I'm thinking of espresso. ☕"
        
    except Exception as e:
        print(f"DEBUG: Chatbot Exception: {str(e)}")
        return "Connection issues... maybe the Wi-Fi needs coffee too? ☕"


@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    message = data.get("message", "")
    if message:
        
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        with open(qa_file, "a", encoding="utf-8") as f:
            f.write(f"\n----\nSource: Chatbot\nMessage: {message}\nDate: {timestamp}\n")
        
        
        if "greeted" not in session:
            session["greeted"] = False

        context = get_data_context()
        greeted_status = session.get("greeted", False)
        
        ai_response = query_huggingface(message, context, greeted=greeted_status)
        
        
        if not session["greeted"] and (message.lower() in ["hi", "hello", "hey"] or ai_response.lower().startswith("hi")):
            session["greeted"] = True

        return jsonify({
            "status": "success",
            "response": ai_response
        })
    return jsonify({"status": "error"}), 400


@app.route("/data")
def get_data():
    """Main JSON API endpoint - returns aggregated coffee sales data"""
    group_by = request.args.get("group_by", "monthly")
    coffee_type = request.args.get("coffee_type", None)
    start_date = request.args.get("start_date", None)
    end_date = request.args.get("end_date", None)
    
    raw_data = load_coffee_data()
    
    
    if start_date:
        raw_data = [d for d in raw_data if d["date"] >= start_date]
    if end_date:
        raw_data = [d for d in raw_data if d["date"] <= end_date]
    
    
    if coffee_type and coffee_type != "all":
        raw_data = [d for d in raw_data if d["coffee_name"] == coffee_type]
    
    aggregated = aggregate_data(raw_data, group_by)
    
    
    result = {
        "labels": sorted(aggregated.keys()),
        "datasets": {
            "total_sales": [aggregated[k]["total_sales"] for k in sorted(aggregated.keys())],
            "transaction_count": [aggregated[k]["count"] for k in sorted(aggregated.keys())]
        },
        "by_type": {},
        "summary": {
            "total_revenue": sum(d["money"] for d in raw_data),
            "total_transactions": len(raw_data),
            "unique_dates": len(set(d["date"] for d in raw_data))
        }
    }
    
    
    all_types = set()
    for key in aggregated:
        all_types.update(aggregated[key]["by_type"].keys())
    
    for coffee_type in all_types:
        result["by_type"][coffee_type] = []
        for key in sorted(aggregated.keys()):
            if coffee_type in aggregated[key]["by_type"]:
                result["by_type"][coffee_type].append(aggregated[key]["by_type"][coffee_type]["total"])
            else:
                result["by_type"][coffee_type].append(0)
    
    return jsonify(result)


@app.route("/data/types")
def get_coffee_types():
    """Get list of all coffee types"""
    raw_data = load_coffee_data()
    types = list(set(d["coffee_name"] for d in raw_data))
    types.sort()
    return jsonify({"types": types})


@app.route("/data/forecast")
def get_forecast():
    """Get forecast data for the next 3 months"""
    raw_data = load_coffee_data()
    monthly_data = aggregate_data(raw_data, "monthly")
    forecast = get_forecast_data(monthly_data)
    
    
    historical = {
        "labels": sorted(monthly_data.keys()),
        "values": [monthly_data[k]["total_sales"] for k in sorted(monthly_data.keys())]
    }
    
    return jsonify({
        "historical": historical,
        "forecast": forecast
    })


@app.route("/data/detail/<month>")
def get_month_detail(month):
    """Get detailed breakdown for a specific month"""
    raw_data = load_coffee_data()
    month_data = [d for d in raw_data if d["date"].startswith(month)]
    
    by_type = {}
    for d in month_data:
        coffee = d["coffee_name"]
        if coffee not in by_type:
            by_type[coffee] = {"total": 0, "count": 0}
        by_type[coffee]["total"] += d["money"]
        by_type[coffee]["count"] += 1
    
    by_day = {}
    for d in month_data:
        day = d["date"]
        if day not in by_day:
            by_day[day] = 0
        by_day[day] += d["money"]
    
    return jsonify({
        "month": month,
        "by_type": by_type,
        "by_day": {
            "labels": sorted(by_day.keys()),
            "values": [by_day[k] for k in sorted(by_day.keys())]
        },
        "summary": {
            "total_revenue": sum(d["money"] for d in month_data),
            "total_transactions": len(month_data),
            "avg_transaction": sum(d["money"] for d in month_data) / len(month_data) if month_data else 0
        }
    })


@app.route("/data/arima_playground")
def arima_playground():
    """Simulated ARIMA endpoint for Interactive Playground"""
    p = int(request.args.get("p", 1))
    d = int(request.args.get("d", 0))
    q = int(request.args.get("q", 1))
    
    raw_data = load_coffee_data()
    monthly_data = aggregate_data(raw_data, "monthly")
    labels = sorted(monthly_data.keys())
    values = [monthly_data[k]["total_sales"] for k in labels]
    
    if len(values) < 5:
        return jsonify({"error": "Not enough data"})
    
    last_val = values[-1]
    
    diffs = [values[i] - values[i-1] for i in range(1, len(values))]
    avg_diff = sum(diffs) / len(diffs) if diffs else 0
    
    forecast = []
    year, month = int(labels[-1][:4]), int(labels[-1][5:7])
    
    current_val = last_val
    for i in range(1, 7):
        trend_impact = avg_diff * (d / 2.0)
        
        ar_impact = (values[-i] - values[-i-1]) * (p / 5.0) if len(values) > i+1 else 0
        
        ma_impact = (sum(values[-3:]) / 3.0 - current_val) * (q / 10.0)
        
        seasonality = 100 * (1 + 0.2 * (abs(6 - month) / 6.0))
        
        noise = (i * 10)
        
        change = trend_impact + ar_impact + ma_impact + noise
        current_val += change
        
        month += 1
        if month > 12:
            month = 1
            year += 1
        
        forecast_month = f"{year}-{month:02d}"
        forecast.append({
            "month": forecast_month,
            "value": max(0, round(current_val, 2))
        })
        
    return jsonify({
        "historical": {
            "labels": labels[-12:], 
            "values": values[-12:]
        },
        "forecast": forecast
    })


@app.route("/static/<path:filename>")
def static_files(filename):
    return send_from_directory("static", filename)


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')
