// src/pages/Prediction/Prediction.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
import axios from 'axios';
import PredictionButton from '../../components/PredictionButton/PredictionButton';
import '../../styles/AppStyles.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Prediction() {
  const { ticker } = useParams();
  const [predictionData, setPredictionData] = useState(null);
  const [stockData, setStockData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch stock data on mount
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/stock_data?ticker=${ticker}`);
        console.log('Stock Data Response:', response.data);
        if (response.data.stock_data) {
          setStockData(response.data.stock_data);
        } else {
          setError('No stock data received');
        }
      } catch (error) {
        console.error('Error fetching stock data:', error);
        setError('Failed to load stock data');
      }
    };
    fetchStockData();
  }, [ticker]);

  const handlePredict = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/predict?ticker=${ticker}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Prediction request failed');
      }
      const result = await response.json();
      console.log('Prediction Result:', result);
      setPredictionData(result);
    } catch (error) {
      console.error('Error making prediction:', error);
      setError('Failed to generate prediction');
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare chart data
  const chartData = {
    labels: stockData.map((data) => data.date) || [],
    datasets: [
      {
        label: `${ticker} Closing Price`,
        data: stockData.map((data) => data.price) || [],
        borderColor:
          predictionData?.prediction === 1
            ? 'rgba(75, 192, 192, 1)' // Green for rise
            : predictionData?.prediction === 0
            ? 'rgba(255, 99, 132, 1)' // Red for fall
            : 'rgba(100, 100, 100, 1)', // Gray if no prediction
        backgroundColor:
          predictionData?.prediction === 1
            ? 'rgba(75, 192, 192, 0.2)'
            : predictionData?.prediction === 0
            ? 'rgba(255, 99, 132, 0.2)'
            : 'rgba(100, 100, 100, 0.2)',
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${ticker} Stock Price (Last 30 Days)`,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Price (USD)',
        },
      },
    },
  };

  return (
    <div className="prediction container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Stock Price Prediction</h2>
      <h3 className="text-xl mb-2">{ticker}</h3>
      <PredictionButton onPredict={handlePredict} />

      {isLoading && <p className="text-gray-500">Generating prediction...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="mt-6">
        {stockData.length > 0 ? (
          <div className="chart-container bg-white p-4 rounded shadow">
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <p className="text-gray-500">No stock data available</p>
        )}

        {predictionData && !isLoading && (
          <div className="prediction-result mt-6">
            <p className="text-lg">
              Prediction:{' '}
              <strong
                className={
                  predictionData.prediction === 1 ? 'text-green-600' : 'text-red-600'
                }
              >
                {predictionData.prediction === 1 ? 'Price will rise' : 'Price will fall'}
              </strong>
            </p>

            {/* Probability Display */}
            <div className="probabilities mt-4">
              <h4 className="text-md font-semibold">Prediction Confidence</h4>
              <div className="mt-2">
                <p>Price will rise ({(predictionData.probability_class_1 * 100).toFixed(1)}%)</p>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-500 h-4 rounded-full"
                    style={{ width: `${predictionData.probability_class_1 * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-2">
                <p>Price will fall ({(predictionData.probability_class_0 * 100).toFixed(1)}%)</p>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-red-500 h-4 rounded-full"
                    style={{ width: `${predictionData.probability_class_0 * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Prediction;