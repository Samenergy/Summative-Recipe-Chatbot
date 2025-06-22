import os
os.environ['CUDA_VISIBLE_DEVICES'] = ''
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_XLA_FLAGS'] = '--tf_xla_enable_xla_devices=false'
os.environ['TF_LOGGING_VERBOSITY'] = 'ERROR'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_CUDNN_DETERMINISTIC'] = '1'

import logging
logging.getLogger('tensorflow').setLevel(logging.ERROR)
logging.getLogger().setLevel(logging.ERROR)

import tensorflow as tf
from transformers import T5Tokenizer, TFT5ForConditionalGeneration
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import re
from datetime import datetime
import time
import json
from typing import Optional,List
from fastapi.middleware.cors import CORSMiddleware


# Configure TensorFlow for CPU-only
tf.config.set_soft_device_placement(True)
tf.config.experimental.set_visible_devices([], 'GPU')
tf.config.optimizer.set_jit(False)

# Initialize FastAPI app
app = FastAPI(title="Recipe QA Chatbot API", version="1.0.0")
# CORS Middleware
origins = ["*"]  # You can replace "*" with specific domains for production

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Log file
os.makedirs('logs', exist_ok=True)
api_error_log = 'logs/api_errors.txt'

# Load model and tokenizer
MODEL_PATH = 'best_recipe_chatbot'
try:
    tokenizer = T5Tokenizer.from_pretrained(MODEL_PATH, legacy=False)
    model = TFT5ForConditionalGeneration.from_pretrained(MODEL_PATH)
    print(f"Model and tokenizer loaded from {MODEL_PATH}")
except Exception as e:
    error_msg = f"Failed to load model or tokenizer: {str(e)}"
    with open(api_error_log, 'a') as f:
        f.write(f"{datetime.now().isoformat()} - Startup Error: {error_msg}\n")
    raise Exception(error_msg)

# Pydantic models for request/response
class QuestionRequest(BaseModel):
    question: str

class PredictResponse(BaseModel):
    answer: str
    status: str

class DetailedPredictResponse(BaseModel):
    answer: str
    raw_answer: Optional[str]
    factual_errors: List[str]
    generation_time: float
    status: str

# Domain detection
def detect_recipe_domain(question: str) -> bool:
    question_lower = question.lower().strip()
    if not re.match(r'^[a-zA-Z0-9\s.,!?()\'\-\°\/:&\+\%]+$', question_lower):
        with open(api_error_log, 'a') as f:
            f.write(f'{datetime.now().isoformat()} - Invalid question: {question}\n')
        return False
    recipe_keywords = [
        'cook', 'recipe', 'ingredient', 'serving', 'bake', 'fry', 'boil', 'grill', 'roast',
        'prep', 'prepare', 'time', 'dish', 'food', 'cuisine', 'dessert', 'appetizer',
        'main', 'side', 'breakfast', 'lunch', 'dinner', 'snack', 'oven', 'stove', 'pan',
        'pot', 'mix', 'chop', 'slice', 'season', 'taste', 'flavor', 'sauce', 'soup', 'salad',
        'rating', 'calories', 'calorie', 'nutrition', 'nutritional', 'serves', 'yield'
    ]
    recipe_patterns = [
        r'\bhow\b.*\b(cook|make|prepare|bake|recipe|calories|calorie|nutrition|serving)\b',
        r'\bwhat\b.*\b(ingredient|dish|recipe|rating|calories|calorie|nutrition|serving)\b',
        r'\bhow\b.*\b(long|time|many)\b.*\b(serving|prep|cook|calories|calorie|nutrition)\b',
        r'\b(ingredient|step|method|rating|calories|calorie|nutrition)\b.*\b(recipe|dish)\b'
    ]
    if any(keyword in question_lower for keyword in recipe_keywords) or \
       any(re.search(pattern, question_lower) for pattern in recipe_patterns):
        return True
    with open(api_error_log, 'a') as f:
        f.write(f'{datetime.now().isoformat()} - Non-recipe: {question}\n')
    return False

# Post-process factual errors
def post_process_factual(answer: str, question: str) -> str:
    if answer.lower().startswith(question.lower()):
        answer = answer[len(question):].strip()
    for prefix in ['question:', 'answer:', 'response:', 'a:', 'q:']:
        if answer.lower().startswith(prefix):
            answer = answer[len(prefix):].strip()
    factual_fixes = {
        'bake at 200': 'bake at 350',
        'fry in water': 'fry in oil',
        'serves 0': 'serves a specific number',
        'prep in seconds': 'prep in minutes',
        'cook for days': 'cook for hours or minutes'
    }
    for error, correction in factual_fixes.items():
        answer = re.sub(re.escape(error), correction, answer, flags=re.IGNORECASE)
    calorie_match = re.search(r'(\d+\.?\d*)\s*calories', answer, re.IGNORECASE)
    if calorie_match:
        calories = float(calorie_match.group(1))
        dish_ranges = {
            'soup': (20, 200),
            'salad': (50, 300),
            'dessert': (100, 500),
            'main': (200, 500)
        }
        for dish_type, (min_cal, max_cal) in dish_ranges.items():
            if dish_type in question.lower() and not (min_cal <= calories <= max_cal):
                answer = answer.replace(calorie_match.group(0), 'a specific calorie count')
                break
        else:
            if not (10 <= calories <= 500):
                answer = answer.replace(calorie_match.group(0), 'a specific calorie count')
    time_match = re.search(r'(\d+)\s*(hour|hr|minute|min)', answer, re.IGNORECASE)
    if time_match:
        time_val = int(time_match.group(1))
        unit = time_match.group(2).lower()
        if (unit.startswith('h') and time_val > 4) or (unit.startswith('m') and time_val > 60 and 'prep' in question.lower()):
            answer = re.sub(r'\d+\s*(hour|hr|minute|min)', 'a reasonable time', answer, flags=re.IGNORECASE)
    words = answer.split()
    cleaned_words = [words[0]] if words else []
    for i in range(1, len(words)):
        if words[i].lower() != words[i-1].lower():
            cleaned_words.append(words[i])
    answer = ' '.join(cleaned_words)
    return answer if len(answer.split()) >= 5 else 'Please provide more details about the recipe question.'

# Check factual errors
def check_factual_errors(answer: str, question: str, expected_answer: str = None) -> list:
    if answer.startswith('Sorry') or answer.startswith('Error'):
        return ['non_recipe_or_error']
    errors = []
    answer_lower = answer.lower()
    error_patterns = {
        'cooking_method_error': ['fry in water', 'bake in microwave', 'boil in oven'],
        'time_error': ['cook for days', 'prep in seconds', 'bake for years'],
        'servings_error': ['serves 0', 'yields zero', 'serves no one'],
        'ingredient_error': ['sugar in savory', 'salt in dessert', 'water as main ingredient']
    }
    for error_type, patterns in error_patterns.items():
        for pattern in patterns:
            if pattern in answer_lower:
                errors.append(error_type)
    tolerance = 0.05
    if 'calories' in question.lower():
        calorie_match = re.search(r'(\d+\.?\d*)\s*calories', answer_lower)
        if calorie_match:
            calories = float(calorie_match.group(1))
            dish_ranges = {
                'soup': (20, 200),
                'salad': (50, 300),
                'dessert': (100, 500),
                'main': (200, 500)
            }
            for dish_type, (min_cal, max_cal) in dish_ranges.items():
                if dish_type in question.lower() and not (min_cal <= calories <= max_cal):
                    errors.append('calorie_range_error')
                    break
            else:
                if not (10 <= calories <= 500):
                    errors.append('calorie_range_error')
            if expected_answer:
                expected_calorie = re.search(r'(\d+\.?\d*)\s*calories', expected_answer.lower())
                if expected_calorie:
                    expected_val = float(expected_calorie.group(1))
                    if abs(calories - expected_val) / expected_val > tolerance:
                        errors.append('calorie_mismatch_error')
        else:
            errors.append('missing_calorie_info')
    if 'rating' in question.lower():
        rating_match = re.search(r'(\d+\.?\d*)\s*(?:based on|out of)', answer_lower)
        if rating_match and expected_answer:
            rating = float(rating_match.group(1))
            expected_rating = re.search(r'(\d+\.?\d*)\s*(?:based on|out of)', expected_answer.lower())
            if expected_rating:
                expected_val = float(expected_rating.group(1))
                if abs(rating - expected_val) > tolerance:
                    errors.append('rating_mismatch_error')
    if 'time' in question.lower():
        time_match = re.search(r'(\d+)\s*(hour|hr|minute|min)', answer_lower)
        if time_match and expected_answer:
            time_val = int(time_match.group(1))
            unit = time_match.group(2).lower()
            expected_time = re.search(r'(\d+)\s*(hour|hr|minute|min)', expected_answer.lower())
            if expected_time:
                exp_time_val = int(expected_time.group(1))
                exp_unit = expected_time.group(2).lower()
                if unit == exp_unit and abs(time_val - exp_time_val) / exp_time_val > 0.2:
                    errors.append('time_mismatch_error')
    words = answer_lower.split()
    for i in range(len(words)-1):
        if words[i] == words[i+1]:
            errors.append('repetition_error')
            break
    return errors

# Generate answer
def generate_answer_optimized(question: str, max_length: int = 80) -> tuple:
    if not detect_recipe_domain(question):
        return 'Sorry, I can only answer recipe-related questions. Try asking about cooking, ingredients, ratings, or calories!', None
    try:
        with tf.device('/CPU:0'):
            input_text = f'question: {question.strip()}'
            input_ids = tokenizer.encode(
                input_text,
                return_tensors='tf',
                max_length=128,  # Match best model (likely exp4)
                truncation=True
            )
            outputs = model.generate(
                input_ids,
                max_length=max_length,
                temperature=0.05,  # Match best model (exp4)
                do_sample=True,
                num_beams=12,  # Match best model (exp4)
                no_repeat_ngram_size=3,
                pad_token_id=tokenizer.pad_token_id,
                eos_token_id=tokenizer.eos_token_id
            )
            raw_tokens = outputs[0].numpy().tolist()
            raw_answer = tokenizer.decode(outputs[0], skip_special_tokens=True, clean_up_tokenization_spaces=True)
            if not re.match(r'^[a-zA-Z0-9\s.,!?()\'\-\°\/:&\+\%]+$', raw_answer):
                with open(api_error_log, 'a') as f:
                    f.write(f'{datetime.now().isoformat()} - Non-English: {question} -> {raw_answer} (Tokens: {raw_tokens})\n')
                return 'Error: Non-English output detected.', raw_answer
            return post_process_factual(raw_answer, question), raw_answer
    except Exception as e:
        with open(api_error_log, 'a') as f:
            f.write(f'{datetime.now().isoformat()} - Error: {question} -> {str(e)}\n')
        return f'Error generating answer: {str(e)}', None

# Endpoints
@app.get("/")
async def health_check():
    return {"status": "API is running", "model": "t5-small", "version": "1.0.0"}

@app.post("/predict", response_model=PredictResponse)
async def predict(request: QuestionRequest):
    try:
        answer, _ = generate_answer_optimized(request.question)
        return PredictResponse(answer=answer, status="success")
    except Exception as e:
        with open(api_error_log, 'a') as f:
            f.write(f'{datetime.now().isoformat()} - /predict Error: {request.question} -> {str(e)}\n')
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/predict_with_details", response_model=DetailedPredictResponse)
async def predict_with_details(request: QuestionRequest):
    try:
        start_time = time.time()
        answer, raw_answer = generate_answer_optimized(request.question)
        generation_time = time.time() - start_time
        factual_errors = check_factual_errors(answer, request.question)
        return DetailedPredictResponse(
            answer=answer,
            raw_answer=raw_answer,
            factual_errors=factual_errors,
            generation_time=generation_time,
            status="success"
        )
    except Exception as e:
        with open(api_error_log, 'a') as f:
            f.write(f'{datetime.now().isoformat()} - /predict_with_details Error: {request.question} -> {str(e)}\n')
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)