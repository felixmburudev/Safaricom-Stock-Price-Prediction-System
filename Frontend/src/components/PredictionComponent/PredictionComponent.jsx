import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import '../../styles/AppStyles.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PredictionComponent = () => {
    const [ticker, setTicker] = useState('GOOGL');
    const [predictionData, setPredictionData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handlePredict = async () => {
        setLoading(true);
        setPredictionData(null);
        try {
          
            const response = await fetch(`http://localhost:8000/predict_price/?ticker=${encodeURIComponent(ticker)}`, {
                method: 'GET',  
                headers: {
                    'Content-Type': 'application/json',  
                },
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            if (result.status === 'success') {
                setPredictionData(result);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error("Error predicting price:", error);
            setPredictionData({ status: "error", message: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleTickerChange = (e) => {
        setTicker(e.target.value.toUpperCase());
    };

    const chartData = predictionData && predictionData.status === "success" ? {
        labels: [...predictionData.dates, 'Next Day'],
        datasets: [
            {
                label: `${ticker} Price Trend`,
                data: [
                    ...predictionData.prices,
                    predictionData.prediction === 1
                        ? predictionData.latest_close * 1.02
                        : predictionData.latest_close * 0.98
                ],
                borderColor: predictionData.prediction === 1 ? 'green' : 'red',
                backgroundColor: predictionData.prediction === 1 ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)',
                fill: false,
                tension: 0.1,
                pointRadius: 3,
                pointHoverRadius: 5,
            },
        ],
    } : null;

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: `${ticker} Price Prediction` },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`,
                },
            },
        },
        scales: {
            x: { title: { display: true, text: 'Date' } },
            y: { title: { display: true, text: 'Price ($)' } },
        },
    };

    return (
        <div className="prediction-container">
            <div>
                <label htmlFor="ticker-input">Company Ticker: </label>
                <input
                    id="ticker-input"
                    type="text"
                    value={ticker}
                    onChange={handleTickerChange}
                    placeholder="e.g., GOOGL, AAPL"
                    disabled={loading}
                />
            </div>
            <button onClick={handlePredict} disabled={loading}>
                {loading ? 'Predicting...' : 'Predict Price'}
            </button>
            {predictionData && (
                <div>
                    {predictionData.status === "success" ? (
                        <>
                            <p>Prediction: {predictionData.prediction === 1 ? 'Price will rise' : 'Price will fall'}</p>
                            <p>Latest Close: ${predictionData.latest_close.toFixed(2)}</p>
                            <Line data={chartData} options={chartOptions} />
                        </>
                    ) : (
                        <p>Error: {predictionData.message}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default PredictionComponent;