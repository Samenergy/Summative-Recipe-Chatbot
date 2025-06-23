# Recipe QA Chatbot

---

## Project Abstract
A full-stack application for answering recipe-related questions using a fine-tuned T5 model. This project explores multi-experiment optimization for recipe question answering, leveraging a custom dataset and modern web technologies. The chatbot is designed to provide accurate, context-aware answers to a wide range of recipe and cooking questions, with a focus on robust evaluation and error analysis.

---

## 🔗 Live Demo & Resources
- **Live Demo:** [recipechatbot.vercel.app](https://recipechatbot.vercel.app/)
- **Dataset:** [HuggingFace recipe.csv](https://huggingface.co/datasets/arya123321/recipes/blob/main/recipe.csv)
- **Full Report (PDF):** See `Samuel Dushime Recipe QA Chatbot Summative Report.pdf`

---

## Features
- **Recipe QA Chatbot:** Answers cooking, ingredient, nutrition, and recipe questions interactively.
- **Fine-tuned T5 Model:** Trained on a custom recipe QA dataset for high accuracy.
- **FastAPI Backend:** Provides REST API endpoints for predictions and detailed responses.
- **React + Vite Frontend:** Modern, responsive UI for user interaction.
- **Experiment Tracking:** Multiple experiments and logs for model optimization and comparison.
- **Jupyter Notebook:** For reproducible research, model development, and visualization.
- **Error Logging:** Tracks API errors, generation errors, and low BLEU scores for analysis.
- **Interactive Testing:** Test the best model live via the web UI.

---

## Project Overview
This project investigates the optimization of a T5-based recipe QA chatbot through four distinct experiments, each testing different hyperparameters, data preprocessing, or generation settings. The workflow includes:
- Data cleaning, domain detection, and augmentation (paraphrasing)
- Training and evaluating T5 models with different configurations
- Logging errors and tracking BLEU/factual error metrics
- Interactive testing with the best model

**Dataset:** `recipe_qa_dataset.json` (~2476 train, 310 validation, 310 test samples)
**Model:** `t5-base`, fine-tuned for recipe QA
**Environment:** M1/M2 Mac, CPU-only

---

## Results
- **Best Experiment:** Identified via composite score (BLEU, error rates, training time)
- **Average BLEU Score:** See `Model/experiments/comparison.csv` for details
- **Error Analysis:** Non-English and factual errors logged in `Model/logs/`
- **Interactive Demo:** Best model deployed in the live chatbot

For full experiment details, visualizations, and evaluation, see the [notebook](Notebook/Summative_recipe_chatbot.ipynb) and the [report PDF](Samuel%20Dushime%20Recipe%20QA%20Chatbot%20Summative%20Report.pdf).

### Experiment Comparison Table

| Experiment | Recipe BLEU | Non-English Errors | Factual Errors | Composite Score | Training Time |
|------------|-------------|-------------------|---------------|----------------|--------------|
| exp1       | 0.462       | 0                 | 53            | 0.643          | 2:28:06      |
| exp2       | 0.502       | 0                 | 63            | 0.670          | 3:13:13      |
| exp3       | 0.472       | 0                 | 50            | 0.651          | 2:38:20      |
| exp4       | 0.477       | 0                 | 51            | 0.653          | 2:32:03      |

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
- **Requirements:** Python 3.9+, TensorFlow, transformers, fastapi, uvicorn, pydantic
- **Install dependencies:**
  ```bash
  pip install tensorflow transformers fastapi uvicorn pydantic
  ```
- **Run the API:**
  ```bash
  cd Model
  python main.py
  # or
  uvicorn main:app --reload --host 0.0.0.0 --port 8000
  ```
- **Model files:** Ensure `best_recipe_chatbot/` or `recipe_chatbot_optimized/` is present in `Model/`.

### 2. Frontend (React + Vite)
- **Requirements:** Node.js 18+
- **Install dependencies:**
  ```bash
  cd Front
  npm install
  ```
- **Run the frontend:**
  ```bash
  npm run dev
  ```
- **Main components:** `Chatbot.jsx`, `Login.jsx`, `Signup.jsx`, `ProtectedRoute.jsx`

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
- **Data:** Located in `Data/` (CSV, JSON). Main file: `recipe_qa_dataset.json`.
- **Experiments:** Tracked in `Model/experiments/` (exp1–exp4), with results in `comparison.csv`.
- **Logs:** API errors, generation errors, and low BLEU scores in `Model/logs/`.
- **Notebook:** `Notebook/Summative_recipe_chatbot.ipynb` — full experiment workflow, visualizations, and interactive testing.

---

## License
MIT License. See `LICENSE` file if present.
