from django.shortcuts import render

import joblib
import pandas as pd
from django.http import JsonResponse
from your_app.models import StockData

def predict_stock_movement(request):
    model = joblib.load("random_forest_model.pkl")

    # Get the latest stock data
    latest_data = StockData.objects.latest('date')

    # Prepare data for prediction
    features = pd.DataFrame([{
        'open_price': latest_data.open_price,
        'high_price': latest_data.high_price,
        'low_price': latest_data.low_price,
        'volume': latest_data.volume
    }])

    # Predict movement
    prediction = model.predict(features)[0]
    result = "Rise" if prediction == 1 else "Fall"

    return JsonResponse({"prediction": result})
