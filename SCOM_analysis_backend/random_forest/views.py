from django.shortcuts import render

import pandas as pd
import numpy as np
from django.core.management.base import BaseCommand
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from data_loader.models import StockData

class Command(BaseCommand):
    help = "Train a Random Forest model to predict stock price movement"

    def handle(self, *args, **kwargs):
        # Fetch stock data from the database
        stock_data = StockData.objects.all().values()
        df = pd.DataFrame(stock_data)

        if df.empty:
            self.stdout.write(self.style.ERROR("No stock data available."))
            return

        # Feature engineering: Define movement as rise (1) or fall (0)
        df['price_movement'] = np.where(df['close_price'] > df['open_price'], 1, 0)

        # Select features and target
        features = ['open_price', 'high_price', 'low_price', 'volume']
        target = 'price_movement'

        X = df[features]
        y = df[target]

        # Split data into training and testing sets
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Train the Random Forest model
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)

        # Evaluate the model
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)

        self.stdout.write(self.style.SUCCESS(f"Model trained with accuracy: {accuracy:.2f}"))

        # Save the model using joblib
        import joblib
        joblib.dump(model, "random_forest_model.pkl")
        self.stdout.write(self.style.SUCCESS("Model saved as random_forest_model.pkl"))
