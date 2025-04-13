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

        # Get at least 4 recent close prices (for 2 percentage changes)
        data = yf.download(ticker, period="5d")[['Close']].dropna()
        print("Downloaded data:\n", data.tail())

        if len(data) < 4:
            return JsonResponse({'error': 'Not enough data to make prediction.'}, status=400)

        # Calculate percentage changes
        close_prices = data['Close']
        lag1 = float(close_prices.iloc[-2])  # t-1
        lag2 = float(close_prices.iloc[-3])  # t-2
        lag3 = float(close_prices.iloc[-4])  # t-3
        pct_change_lag1 = (lag1 - lag2) / lag2 * 100
        pct_change_lag2 = (lag2 - lag3) / lag3 * 100
        input_data = np.array([[pct_change_lag1, pct_change_lag2]])  # Shape: (1, 2)
        print("Input data for prediction:", input_data)
        print("Input data shape:", input_data.shape)

        # Load trained model
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