// src/pages/Prediction/Prediction.js
import React, { useState } from 'react';
import PredictionButton from '../../components/PredictionButton/PredictionButton';
import StockChart from '../../components/StockChart/StockChart';
import '../../styles/AppStyles.css';

function Prediction() {
  const [predictionData, setPredictionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePredict = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://your-django-api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setPredictionData(data);
    } catch (error) {
      console.error('Error making prediction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="prediction">
      <h2>Stock Price Prediction</h2>
      <PredictionButton onPredict={handlePredict} />
      {isLoading && <p className="loading">Generating prediction...</p>}
      {predictionData && !isLoading && (
        <div className="prediction-result">
          <p>Predicted Price: <strong>{predictionData.predictedPrice}</strong></p>
          <StockChart stockData={predictionData} />
        </div>
      )}
    </div>
  );
}

export default Prediction;