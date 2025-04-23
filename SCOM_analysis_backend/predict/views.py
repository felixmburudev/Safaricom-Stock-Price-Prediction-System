import yfinance as yf
import joblib
import os
import numpy as np
from django.http import JsonResponse
from django.conf import settings

def predict_stock(request):
    try:
        ticker = request.GET.get('ticker', '')
        print(f"Received ticker: {ticker}")

        data = yf.download(ticker, period="1y")[['Close', 'Volume']].dropna()
        print("Downloaded data:\n", data.tail())

        if len(data) < 4:
            return JsonResponse({'error': 'Not enough data to make prediction.'}, status=400)

        close_prices = data['Close']
        data['Lag1'] = close_prices.shift(1)  # t-1
        data['Lag2'] = close_prices.shift(2)  # t-2
        data['Lag3'] = close_prices.shift(3)  # t-3
        data['Pct_Change_Lag1'] = (data['Lag1'] - data['Lag2']) / data['Lag2'] * 100
        data['Pct_Change_Lag2'] = (data['Lag2'] - data['Lag3']) / data['Lag3'] * 100
        data['SMA_20'] = close_prices.rolling(window=20).mean()  # 20-day Simple Moving Average
        data['SMA_50'] = close_prices.rolling(window=50).mean()  # 50-day Simple Moving Average
        data['RSI'] = 100 - (100 / (1 + (close_prices.diff(1).gt(0).rolling(window=14).sum() / close_prices.diff(1).lt(0).rolling(window=14).sum())))
        data = data.dropna()

        print(f"Processed data with features:\n{data.tail()}")

        input_data = data[['Pct_Change_Lag1', 'Pct_Change_Lag2', 'SMA_20', 'SMA_50', 'RSI']].iloc[-1:].values
        print("Input data for prediction:", input_data)

        # Load the trained model
        model_path = os.path.join(settings.BASE_DIR, 'random_forest', 'models', 'rf_model.pkl')
        model = joblib.load(model_path)
        print("Expected features:", model.n_features_in_)

        # Predict using the model
        prediction = model.predict(input_data)[0]
        print("Prediction result:", prediction)

        # Get prediction probabilities
        probabilities = model.predict_proba(input_data)[0]
        print("Prediction probabilities:", probabilities)

        # Format response
        response = {
            'prediction': int(prediction),
            'probability_class_0': float(probabilities[0]),
            'probability_class_1': float(probabilities[1])
        }

        return JsonResponse(response)

    except Exception as e:
        print(f"Exception during prediction: {e}")
        return JsonResponse({'error': str(e)}, status=500)
