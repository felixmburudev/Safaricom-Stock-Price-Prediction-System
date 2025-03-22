// src/components/PredictionButton/PredictionButton.js
import React from 'react';
import '../../styles/AppStyles.css';

function PredictionButton({ onPredict }) {
  return (
    <button 
      className="predict-button"
      onClick={onPredict}
    >
      Make Prediction
    </button>
  );
}

export default PredictionButton;