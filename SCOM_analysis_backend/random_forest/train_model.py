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

def add_technical_indicators(data):
    data['Lag1'] = data['Close'].shift(1)
    data['Lag2'] = data['Close'].shift(2)
    data['SMA_20'] = data['Close'].rolling(window=20).mean()
    data['SMA_50'] = data['Close'].rolling(window=50).mean()
    delta = data['Close'].diff()
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)
    avg_gain = gain.rolling(window=14).mean()
    avg_loss = loss.rolling(window=14).mean()
    rs = avg_gain / avg_loss
    data['RSI'] = 100 - (100 / (1 + rs))
    data['Target'] = (data['Close'].shift(-1) > data['Close']).astype(int)
    return data.dropna()

def train_model(ticker, n_estimators, max_depth, random_state, start_date, end_date):
    try:
        update_progress("Fetching data", 10)
        data = yf.download(ticker, start=start_date, end=end_date)
        if data.empty:
            raise ValueError("No data found for the given ticker and date range.")
        
        update_progress("Adding indicators", 30)
        data = add_technical_indicators(data)

        X = data[['Lag1', 'Lag2', 'SMA_20', 'SMA_50', 'RSI']]
        y = data['Target']

        update_progress("Training model", 60)
        model = RandomForestClassifier(n_estimators=n_estimators, max_depth=max_depth, random_state=random_state)
        model.fit(X, y)

        model_path = os.path.join(settings.BASE_DIR, 'random_forest', 'models', 'rf_model.pkl')
        joblib.dump(model, model_path)

        update_progress("Done", 100)
        return True
    except Exception as e:
        print(f"Error in training: {str(e)}")
        update_progress("Error", 0)
        return False

def train_batch_model(tickers, start_date, end_date, n_estimators=100, max_depth=10, random_state=42):
    try:
        combined_data = pd.DataFrame()
        update_progress("Fetching data", 10)

        for ticker in tickers:
            print(f"Fetching data for {ticker}")
            data = yf.download(ticker, start=start_date, end=end_date)
            if data.empty:
                continue
            data['Ticker'] = ticker
            data = add_technical_indicators(data)
            combined_data = pd.concat([combined_data, data])
            print(f"Data for {ticker} processed.")

        update_progress("Training batch model", 70)
        X = combined_data[['Lag1', 'Lag2', 'SMA_20', 'SMA_50', 'RSI']]
        y = combined_data['Target']

        model = RandomForestClassifier(n_estimators=n_estimators, max_depth=max_depth, random_state=random_state)
        model.fit(X, y)

        model_path = os.path.join(settings.BASE_DIR, 'random_forest', 'models', 'rf_model.pkl')
        joblib.dump(model, model_path)
        update_progress("Batch training done", 100)

        return True
    except Exception as e:
        print(f"Error occurred during batch training: {str(e)}")
        update_progress("Error", 0)
        raise e
