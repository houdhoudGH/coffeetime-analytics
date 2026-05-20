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
From raw coffee shop transactions to a fully interactive analytics platform —<br/>
with a <strong>data-aware AI chatbot</strong> that answers questions about your own sales data in real time.
</p>

</div>

---

## 🎬 Demo Video

<!-- Upload your video to YouTube, take a screenshot as thumbnail, save as docs/images/video_thumbnail.png -->
[![CoffeeTime Demo](Recording 2026-05-20 134923.mp4)]

*Click to watch the full platform walkthrough*

---

## 🌟 What Makes This Project Stand Out

This is not a notebook — it's a **fully deployed, production-grade web application**:

- 🤖 **AI Chatbot** — powered by Llama 3.1-8B via HuggingFace, data-aware, multilingual, with conversation memory
- 📊 **Live REST API** — 6 dynamic JSON endpoints serving real aggregated sales data
- 🎨 **4 color themes + dark/light mode** — persisted in localStorage
- 📈 **Dual charting libraries** — Chart.js for trends, D3.js for animated comparisons
- 🔍 **Dynamic filtering** — date range, coffee type, and grouping — all hitting the live API
- 🏆 **SARIMAX model** — best forecasting result with MAE 3.54
- 📱 **Fully responsive** — mobile, tablet, and desktop

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

### Home Page

<div align="center">
  <img src="Screenshot 2026-05-20 133813.png" width="85%" alt="CoffeeTime Home Hero"/>
</div>

<div align="center" style="margin-top:8px">
  <img src="Screenshot 2026-05-20 133505.png" width="48%" alt="Key Insights"/>
  <img src="Screenshot 2026-05-20 133529.png" width="48%" alt="Analysis Journey"/>
</div>

<br/>

- **Hero section** with animated gradient title and coffee image
- **4 Key Insights cards** — seasonal patterns, peak hours, popular drinks, growth trend
- **Analysis journey** — 3-step flow from raw data to forecasting
- Live sample data table loaded from the API

---

### EDA Page

<div align="center">
  <img src="Screenshot 2026-05-20 133438.png" width="85%" alt="EDA Dashboard — Chart.js and D3.js"/>
  <br/>
  <sub><i>Live Chart.js monthly trend + D3.js sales by coffee type — both interactive and filterable</i></sub>
</div>

<br/>

**Live stats banner** (pulled from `/data` API in real time):

| Stat | Value |
|---|---|
| Total Revenue | Live from CSV |
| Total Transactions | Live from CSV |
| Days Analyzed | Live from CSV |

**10 static analysis charts** filterable by category (Hourly / Daily / Monthly / Product):

| Category | Charts |
|---|---|
| Hourly | Hourly sales, Revenue by hour & coffee type, Hourly by weekday (sum + avg) |
| Daily | Daily sales for the full year |
| Monthly | Monthly distribution, Total monthly sales, Monthly by coffee type |
| Product | Popularity by count, Revenue by coffee type |

---

### Modeling Page

<div align="center">
  <img src="Screenshot 2026-05-20 133557.png" width="85%" alt="Model Comparison"/>
  <br/>
  <sub><i>SARIMAX wins with MAE 3.54 — interactive model cards with performance metrics</i></sub>
</div>

<br/>

| Model | MAE | Notes |
|---|---|---|
| ARIMA (5,0,5) | 4.86 | Good baseline, misses weekly seasonality |
| Auto ARIMA | 5.03 | Conservative, smooths over peaks |
| **SARIMAX (5,0,5)(1,1,1,7)** | **3.54** | ✅ Best — captures weekly cycles perfectly |

<br/>

**Interactive ARIMA Playground** — adjust p, d, q sliders and see the forecast update live:

<div align="center">
  <img src="Screenshot 2026-05-20 133622.png" width="85%" alt="Interactive ARIMA Playground"/>
  <br/>
  <sub><i>Manually tune ARIMA parameters and watch the dynamic forecast react in real time</i></sub>
</div>

<br/>

<div align="center">
  <img src="Screenshot 2026-05-20 133646.png" width="85%" alt="Conclusion and Recommendation"/>
</div>

---

### Questions Page

<div align="center">
  <img src="Screenshot 2026-05-20 133727.png" width="85%" alt="FAQ Page"/>
</div>

- Contact form with real-time validation and character counter
- FAQ section with collapsible cards
- All messages saved to `static/qa/messages.txt`

---

## 💬 AI Chatbot Assistant

Every page has a floating chatbot bubble in the bottom-right corner. The Coffee Assistant is powered by **Llama 3.1-8B** and reads live sales data to answer questions in context.

<div align="center">
  <img src="Screenshot 2026-05-20 134955.png" width="32%" alt="Chatbot greeting"/>
  <img src="Screenshot 2026-05-20 135012.png" width="32%" alt="Chatbot answering"/>
  <img src="Screenshot 2026-05-20 135059.png" width="32%" alt="Chatbot in French"/>
</div>

<br/>

**Highlights from the demo above:**
- Greets users on first load with conversation memory
- Answers navigation questions: *"where can I find the models?"* → directs to Modeling page
- **Multilingual** — switches to French when asked: *"vous parlez français?"* → *"Oui, je parle un peu de français..."*
- Reads live sales data context on every query

**What makes it special:**
- **Data-aware** — total revenue, top coffee type, latest month performance injected into every prompt
- **Conversation memory** — remembers last 20 messages for natural follow-up questions
- **Multilingual** — responds in the user's language automatically
- **All conversations logged** to `static/qa/messages.txt`

```python
# Data context injected into every chatbot prompt
f"Total revenue: ${total_rev} from {total_trans} transactions.
  Top coffee: {top_coffee}.
  Latest month ({latest_month}): ${latest_sales}"
```

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

## 🎤 Presentation

This project was presented as a full platform pitch covering the problem, solution, platform overview, forecasting models, AI assistant, and business value.

📊 [View Slide Deck (PDF)](docs/CoffeeTime_Presentation.pdf)

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

**Built by [Houda](https://github.com/houdhoudGH)**
*· Master 2 Data Science & NLP · AI Engineer ·*

<br/>
<sub>Flask · Llama 3.1 · Statsmodels · Chart.js · D3.js · Pico CSS · HuggingFace</sub>

</div>
