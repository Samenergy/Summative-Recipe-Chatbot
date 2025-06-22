# Recipe QA Chatbot

A full-stack application for answering recipe-related questions using a fine-tuned T5 model, with a React + Vite frontend and a FastAPI backend. The project includes data, experiments, and an interactive chatbot UI.

---

## Features
- **Recipe QA Chatbot**: Answers cooking, ingredient, nutrition, and recipe questions.
- **Fine-tuned T5 Model**: Trained on a custom recipe QA dataset.
- **FastAPI Backend**: Provides REST API endpoints for predictions.
- **React + Vite Frontend**: Modern, responsive UI for user interaction.
- **Experiment Tracking**: Multiple experiments and logs for model optimization.
- **Jupyter Notebook**: For reproducible research and model development.

---

## Directory Structure
```
.
├── Data/                # Datasets (CSV, JSON)
├── Front/               # Frontend (React + Vite)
│   └── src/components/  # Chatbot, Login, Signup, ProtectedRoute
├── Model/               # Backend (FastAPI, T5 model, logs, experiments)
│   ├── best_recipe_chatbot/   # Main model artifacts
│   ├── experiments/           # Experiment runs (exp1, exp2, ...)
│   ├── logs/                  # API and generation logs
│   └── main.py                # FastAPI app
├── Notebook/            # Jupyter notebook for experiments
├── recipe_chatbot_optimized/  # Optimized model artifacts
```

---

## Setup & Installation

### 1. Backend (FastAPI + T5)
- **Requirements**: Python 3.9+, TensorFlow, transformers, fastapi, uvicorn, pydantic
- **Install dependencies**:
  ```bash
  pip install tensorflow transformers fastapi uvicorn pydantic
  ```
- **Run the API**:
  ```bash
  cd Model
  python main.py
  # or
  uvicorn main:app --reload --host 0.0.0.0 --port 8000
  ```
- **Model files**: Ensure `best_recipe_chatbot/` or `recipe_chatbot_optimized/` is present in `Model/`.

### 2. Frontend (React + Vite)
- **Requirements**: Node.js 18+
- **Install dependencies**:
  ```bash
  cd Front
  npm install
  ```
- **Run the frontend**:
  ```bash
  npm run dev
  ```
- **Main components**: `Chatbot.jsx`, `Login.jsx`, `Signup.jsx`, `ProtectedRoute.jsx`

---

## API Endpoints
- `GET /` — Health check
- `POST /predict` — Get answer to a recipe question
  - Request: `{ "question": "How long to bake a cake?" }`
  - Response: `{ "answer": "Bake at 350°F for 30 minutes.", "status": "success" }`
- `POST /predict_with_details` — Get answer with details
  - Response includes: `answer`, `raw_answer`, `factual_errors`, `generation_time`, `status`

---

## Data & Experiments
- **Data**: Located in `Data/` (CSV, JSON). Main file: `recipe_qa_dataset.json`.
- **Experiments**: Tracked in `Model/experiments/` (exp1–exp4), with results in `comparison.csv`.
- **Logs**: API errors, generation errors, and low BLEU scores in `Model/logs/`.
- **Notebook**: `Notebook/Summative_recipe_chatbot.ipynb` — full experiment workflow, visualizations, and interactive testing.

---

## License
MIT License. See `LICENSE` file if present.

---

# Summative-Recipe-Chatbot
