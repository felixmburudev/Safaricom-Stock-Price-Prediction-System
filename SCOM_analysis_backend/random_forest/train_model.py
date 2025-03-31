import yfinance as yf
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib
import json
import os
from django.conf import settings

PROGRESS_FILE = os.path.join(settings.BASE_DIR, 'random_forest', 'training_progress.json')

def update_progress(stage, percentage):
    progress = {"stage": stage, "percentage": percentage}
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(progress, f)

def train_model():
    try:
        update_progress("Fetching data", 0)
        # ticker = "SAFARICOM.NR"  
        ticker = "GOOGL"  
        data = yf.download(ticker, start="2020-01-01", end="2025-03-31")
        update_progress("Fetching data", 33)

        update_progress("Cleaning and modifying data", 33)
        data = data[['Close']].dropna()
        data['Lag1'] = data['Close'].shift(1)
        data['Lag2'] = data['Close'].shift(2)
        data['Target'] = (data['Close'].shift(-1) > data['Close']).astype(int)
        data = data.dropna()
        update_progress("Cleaning and modifying data", 66)

        update_progress("Training model", 66)
        X = data[['Lag1', 'Lag2']]
        y = data['Target']
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X, y)
        update_progress("Training model", 100)

        model_path = os.path.join(settings.BASE_DIR, 'random_forest', 'models', 'rf_model.pkl')
        joblib.dump(model, model_path)
        return True
    except Exception as e:
        update_progress("Error", 0)
        raise e