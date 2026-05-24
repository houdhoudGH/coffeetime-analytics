<div align="center">

<h1>☕ CoffeeTime Analytics</h1>

<p><strong>Full-stack coffee sales forecasting platform — interactive EDA, ARIMA/SARIMA/SARIMAX models, live data API, and an AI-powered chatbot assistant</strong></p>

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-Web_App-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![Statsmodels](https://img.shields.io/badge/Statsmodels-Time_Series-4B8BBE?style=flat-square)](https://www.statsmodels.org)
[![Chart.js](https://img.shields.io/badge/Chart.js-Interactive-FF6384?style=flat-square)](https://chartjs.org)
[![D3.js](https://img.shields.io/badge/D3.js-Visualizations-F9A03C?style=flat-square)](https://d3js.org)
[![Llama 3.1](https://img.shields.io/badge/Llama_3.1-8B_Chatbot-blueviolet?style=flat-square)](https://huggingface.co)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

<br/>

<p>
Building a great forecast is only half the job.<br/>
The other half is making sure <strong>anyone</strong> — technical or not — can understand, explore, and act on it.
</p>

</div>

---

## 🌟 The Philosophy Behind This Project

Time series modeling is hard. But the real challenge isn't the math — it's **communicating the results**.

A SARIMAX model with MAE 3.54 means nothing to a coffee shop manager who just wants to know how much Latte to stock next week. So we didn't stop at the notebooks. We built a **complete forecasting station**: an interactive web platform where the analysis is visual, the models are explorable, and an AI assistant reads the data and explains it in plain language.

This project is two things at once:
- A rigorous time series study with ARIMA, Auto ARIMA, and SARIMAX models
- A storytelling platform that makes those results accessible to anyone

---

## 🗺️ Architecture

```
Raw CSV Sales Data (index_1.csv)
        │
        ├── eda.ipynb          → 10 visualizations (hourly, daily, monthly, product)
        └── prediction.ipynb   → ARIMA, Auto ARIMA, SARIMAX modeling
                │
                ▼
        Flask Web Application (app.py)
        │
        ├── /              → Home: hero, key insights, sample data table
        ├── /eda           → EDA: static plots + live Chart.js + D3.js
        ├── /modeling      → Models: results + interactive ARIMA playground
        ├── /question      → Contact form with real-time validation
        │
        ├── /data          → REST API: aggregated sales (monthly/daily/hourly)
        ├── /data/forecast → Linear regression forecast (next 3 months)
        ├── /data/detail/<month> → Drill-down per month
        ├── /data/arima_playground → Interactive ARIMA parameter explorer
        │
        └── /chat          → AI Chatbot — Llama 3.1-8B via HuggingFace
```

---

## 📊 The Platform

### Home Page — The Entry Point

The home page sets the stage: a clean hero section with the project title, followed by four key insight cards that surface the most important findings from the data immediately — no digging required.

<div align="center">
  <img src="Screenshot_2026-05-24_160600.png" width="85%" alt="CoffeeTime Home Hero"/>
</div>

<br/>

<div align="center">
  <img src="Screenshot_2026-05-24_160652.png" width="85%" alt="Key Insights Cards"/>
</div>

The four insight cards give any visitor — technical or not — an instant read on the business:

- **Seasonal Patterns** — fall and winter peak in October and February
- **Peak Hours** — the 10–12 AM window dominates across all weekdays
- **Popular Drinks** — Latte leads in revenue despite Americano with Milk being most purchased
- **Growth Trend** — predictable weekly and seasonal cycles, ideal for SARIMAX

---

### EDA Page — Visual Analysis for Everyone

The EDA page is built around one idea: **you shouldn't need to read a notebook to understand the data**. All charts are interactive, filterable, and live — pulling from the REST API in real time.

<div align="center">
  <img src="Screenshot_2026-05-24_160709.png" width="85%" alt="EDA Stats Banner and Filters"/>
</div>

A live stats banner at the top shows total revenue, transaction count, and days analyzed — always up to date from the API. Below it, dynamic filters let you slice by date range, coffee type, and grouping (monthly, daily, hourly).

<div align="center">
  <img src="Screenshot_2026-05-24_160834.png" width="85%" alt="Monthly Sales Trend Chart.js and D3 Sales by Coffee Type"/>
</div>

<div align="center">
  <img src="Screenshot_2026-05-24_160855.png" width="85%" alt="Daily granularity view"/>
</div>

<div align="center">
  <img src="Screenshot_2026-05-24_160921.png" width="85%" alt="Filtered by coffee type — Espresso only"/>
</div>

Two live chart panels sit side by side:

- **Monthly Sales Trend (Chart.js)** — an interactive line chart with dual axes (revenue + transaction count). Click legend items to toggle series. Switch grouping from monthly to daily to hourly — the chart re-renders instantly from the API.
- **Sales by Coffee Type (D3.js)** — an animated bar chart. Click any bar to filter the entire page by that coffee type, instantly isolating that product's trend across all charts.

This is exploratory data analysis made genuinely accessible: a non-technical manager can filter to "Espresso only" in one click and immediately see its seasonal curve and revenue contribution.

**10 static analysis charts** are also available, filterable by category:

| Category | Charts |
|---|---|
| Hourly | Hourly sales, Revenue by hour & coffee type, Hourly by weekday (sum + avg) |
| Daily | Daily sales for the full year |
| Monthly | Monthly distribution, Total monthly sales, Monthly by coffee type |
| Product | Popularity by count, Revenue by coffee type |

---

### Modeling Page — From Numbers to Insight

The modeling page does something most forecasting projects skip: it shows the **work**, not just the result. Every model decision is explained, every metric is visible, and the best result is put in context.

<div align="center">
  <img src="Screenshot_2026-05-24_161002.png" width="85%" alt="Model MAE Comparison and SARIMAX Forecast"/>
</div>

The performance visualization puts all three models side by side:

| Model | MAE | Notes |
|---|---|---|
| ARIMA (5,0,5) | 4.86 | Good baseline, misses weekly seasonality |
| Auto ARIMA | 5.03 | Conservative, smooths over peaks |
| **SARIMAX (5,0,5)(1,1,1,7)** | **3.54** | ✅ Best — captures weekly cycles perfectly |

The SARIMAX forecast chart shows historical sales alongside the 3-month prediction — not just a number, but a visual you can hand to any stakeholder.

---

### Interactive ARIMA Playground — Teaching Through Exploration

This is the feature that turns the modeling page from a results slide into a learning tool. Instead of just showing the best model, we let visitors **tune the parameters themselves** and watch the forecast react.

<div align="center">
  <img src="Screenshot_2026-05-24_161049.png" width="85%" alt="Interactive ARIMA Playground with sliders"/>
</div>

Three sliders control **p** (autoregressive order), **d** (differencing), and **q** (moving average). Every change triggers a live API call that returns a new simulated forecast, rendered immediately on the chart.

This does two things:
1. **For technical visitors** — it shows the sensitivity of ARIMA to hyperparameter choices, making the case for why SARIMAX with seasonal terms wins
2. **For non-technical visitors** — it makes abstract model parameters tangible: move a slider, see the forecast change, understand what "tuning" actually means

The playground is the clearest demonstration that we didn't just run models — we understood them well enough to explain them.

---

## 💬 AI Chatbot — A Data-Aware Assistant

Every page has a floating Coffee Assistant in the bottom-right corner, powered by **Llama 3.1-8B**. It's not a generic FAQ bot — it reads live sales data and injects it into every prompt, so it can answer questions grounded in the actual numbers.

<div align="center">
  <img src="Screenshot_2026-05-24_161123.png" width="85%" alt="Chatbot answering navigation question"/>
</div>

<div align="center">
  <img src="Screenshot_2026-05-24_161209.png" width="85%" alt="Chatbot answering most and least sold coffee type"/>
</div>

<div align="center">
  <img src="Screenshot_2026-05-24_161257.png" width="85%" alt="Chatbot answering data question"/>
</div>

<div align="center">
  <img src="Screenshot_2026-05-24_161414.png" width="85%" alt="Chatbot forecasting next hour demand"/>
</div>

**What the assistant can do:**

- **Navigate the platform** — *"where can I find the models?"* → directs to the Modeling page with context
- **Answer data questions** — *"what is the most sold coffee type?"* → *"Based on our current data, Latte leads in revenue"*
- **Give follow-up insights** — *"and what's the least?"* → remembers the conversation and answers *"Mocha has the lowest sales volume"*
- **Interpret forecasts** — *"based on our forecast, how much will demand be next hour?"* → returns a structured demand prediction with product breakdown

The data context injected into every prompt:

```python
f"Total revenue: ${total_rev} from {total_trans} transactions.
  Top coffee: {top_coffee}.
  Latest month ({latest_month}): ${latest_sales}"
```

**What makes it more than a chatbot:**
- **Data-aware** — every answer is grounded in live sales figures, not generic knowledge
- **Conversation memory** — remembers the last 20 messages for natural follow-up questions
- **Closes the loop** — the same insights the model found are now accessible in plain language, on demand, to anyone using the platform

---

## 🔌 REST API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/data` | GET | Aggregated sales (monthly/daily/hourly), filterable by date & type |
| `/data/types` | GET | List of all coffee types |
| `/data/forecast` | GET | Linear regression forecast for next 3 months |
| `/data/detail/<month>` | GET | Drill-down: by-day and by-type breakdown for a month |
| `/data/arima_playground` | GET | Simulated ARIMA forecast with p/d/q parameters |
| `/chat` | POST | AI chatbot — sends message, returns Llama 3.1 response |

---

## 🎨 UI Features

<div align="center">
  <img src="Screenshot_2026-05-24_162153.png" width="85%" alt="Full platform overview"/>
</div>

- **4 color themes**: Coffee (default), Pink, Blue, Green — switchable from navbar
- **Dark / Light mode** toggle — persisted in `localStorage`
- **Collapsible sections** — toggle panels with smooth animations
- **Export to PNG** — download charts directly from the browser
- **Real-time form validation** — name, email, message with character counter
- **Responsive design** — Pico CSS + custom media queries
- **Font Awesome 6** icons throughout

---

## 📁 Project Structure

```
coffeetime-analytics/
├── app.py                     # Flask app + REST API + chatbot endpoint
├── index.html                 # Home page
├── eda.html                   # EDA dashboard
├── modeling.html              # Forecasting results + ARIMA playground
├── question.html              # Contact form with validation
├── static/
│   ├── style.css              # Custom CSS with theming variables
│   ├── script.js              # Chart.js, D3.js, filters, dark mode
│   ├── chatbot.css            # Chatbot bubble and window styles
│   ├── chatbot.js             # Chatbot UI, fetch /chat, conversation logic
│   ├── pico.min.css           # Pico CSS framework
│   └── img/
│       ├── coffee.jpg         # Hero image
│       ├── chatbot-icon.svg   # Chatbot bubble icon
│       ├── eda/               # 10 EDA plot images
│       └── modeling/          # ARIMA/SARIMA/SARIMAX result images
├── data/
│   └── raw/
│       └── index_1.csv        # Coffee sales dataset (git-ignored)
├── notebooks/
│   ├── eda.ipynb              # Exploratory data analysis
│   └── prediction.ipynb       # Time series modeling
└── docs/
    └── images/                # Screenshots for this README
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Flask, Python 3, Flask-CORS |
| **AI Chatbot** | Llama 3.1-8B-Instruct via HuggingFace Inference Router |
| **Time Series** | Statsmodels (ARIMA, SARIMAX), pmdarima (Auto ARIMA) |
| **Data Analysis** | Pandas, NumPy, Matplotlib, Seaborn |
| **Frontend** | HTML5, CSS3, Vanilla JS (ES6+) |
| **Charts** | Chart.js (line charts), D3.js (animated bar charts) |
| **UI Framework** | Pico CSS + custom theming with CSS variables |
| **Icons** | Font Awesome 6 |
| **Typography** | Inter (Google Fonts) |

---

## 🚀 Getting Started

```bash
git clone https://github.com/houdhoudGH/coffeetime-analytics.git
cd coffeetime-analytics

python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate

pip install flask flask-cors python-dotenv requests pandas numpy \
            matplotlib seaborn statsmodels pmdarima scikit-learn
```

Create a `.env` file:
```
HF_API_TOKEN=your-huggingface-token
HF_MODEL_ID=meta-llama/Llama-3.1-8B-Instruct
```

Run:
```bash
python app.py
```

Open `http://localhost:5000` 🚀

---

## 📈 Key Business Insights

1. **Staff 10–12 AM heavily** — consistently the busiest window across all weekdays
2. **Stock Hot Chocolate and Cocoa in winter** — demand is weather-driven
3. **October and February are peak months** — plan inventory accordingly
4. **Latte drives revenue** — highest revenue per cup despite not being most purchased
5. **SARIMAX predicts demand with MAE 3.54** — reliable for daily ordering decisions

---

## 🔮 Future Work

- [ ] Deploy to cloud (Render or Railway)
- [ ] Add live CSV upload — instant fresh analysis
- [ ] Extend SARIMAX with external regressors (weather, holidays)
- [ ] Add Prophet model for comparison
- [ ] Give the chatbot persistent memory across sessions

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

### Made with 💜 by **Gheffari Nour El Houda**

*Master 2 Data Science & NLP · AI Engineer*

[![GitHub](https://img.shields.io/badge/GitHub-houdhoudGH-181717?style=flat-square&logo=github)](https://github.com/houdhoudGH)

</div>
