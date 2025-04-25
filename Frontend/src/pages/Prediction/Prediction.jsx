
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
import companies from '../../components/Training/companies';
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

function Prediction() {
  const { ticker: urlTicker } = useParams();
  const [ticker, setTicker] = useState(urlTicker || '');
  const [stockData, setStockData] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticker) return;

    const fetchStockData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`http://localhost:8000/stock_data?ticker=${ticker}`);
        console.log('Stock Data Response:', response.data);
        setStockData(response.data);
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError('Failed to load stock data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, [ticker]);

  const handlePredict = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/predict?ticker=${ticker}`);
      if (!response.ok) throw new Error('Prediction request failed');
      const result = await response.json();
      console.log('Prediction Result:', result);
      setPredictionData(result);
    } catch (err) {
      console.error('Error making prediction:', err);
      setError('Failed to generate prediction');
    } finally {
      setIsLoading(false);
    }
  };

  const getExtendedData = () => {
    if (!stockData) return [];

    const originalData = stockData.prices;
    const lastPrice = originalData[originalData.length - 1];
    let extendedPrice;

    if (predictionData?.prediction === 1) {
      extendedPrice = lastPrice * 1.05;
    } else if (predictionData?.prediction === 0) {
      extendedPrice = lastPrice * 0.95;
    } else {
      extendedPrice = lastPrice;
    }

    const extensionLength = Math.floor(originalData.length / 4);
    const extension = new Array(extensionLength).fill(null);
    extension[extensionLength - 1] = extendedPrice;

    return [...originalData, ...extension];
  };

  const chartData = stockData
    ? {
        labels: [...stockData.dates, ...new Array(Math.floor(stockData.dates.length / 4)).fill('')],
        datasets: [
          {
            label: `${ticker} Closing Price`,
            data: getExtendedData(),
            borderColor:
              predictionData?.prediction === 1
                ? 'rgba(0, 200, 0, 1)'
                : predictionData?.prediction === 0
                ? 'rgba(255, 0, 0, 1)'
                : 'rgba(100, 100, 100, 1)',
            backgroundColor:
              predictionData?.prediction === 1
                ? 'rgba(0, 200, 0, 0.1)'
                : predictionData?.prediction === 0
                ? 'rgba(255, 0, 0, 0.1)'
                : 'rgba(100, 100, 100, 0.1)',
            fill: false,
            tension: 0.25,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${ticker} Stock Prices`,
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

      {!urlTicker && (
        <div>
          <label htmlFor="ticker-input">Select Company: </label>
          <select
            id="ticker-input"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
          >
            <option value="">Select a company</option>
            {companies.map((company) => (
              <option key={company.symbol} value={company.symbol}>
                {company.name} ({company.symbol})
              </option>
            ))}
          </select>
        </div>
      )}

      <h3 className="text-xl mb-2">{ticker}</h3>
      <PredictionButton onPredict={handlePredict} />

      {isLoading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="mt-6">
        {chartData ? (
          <div className="chart-container bg-white p-4 rounded shadow">
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          !isLoading && <p className="text-gray-500">No stock data available</p>
        )}

        {predictionData && (
          <div className="prediction-result mt-6">
            <p className="text-lg">
              Prediction:{' '}
              <strong
                className={
                  predictionData.prediction === 1
                    ? 'text-green-600'
                    : 'text-red-600'
                }
              >
                {predictionData.prediction === 1 ? 'Price will rise' : 'Price will fall'}
              </strong>
            </p>

            <div className="probabilities mt-4">
              <h4 className="text-md font-semibold">Prediction Confidence</h4>
              <div className="mt-2">
                <p>Price will rise ({(predictionData.probability_class_1 * 100).toFixed(1)}%)</p>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-500 h-4 rounded-full"
                    style={{ width: `${predictionData.probability_class_1 * 100}%` }}
                  />
                </div>
              </div>
              <div className="mt-2">
                <p>Price will fall ({(predictionData.probability_class_0 * 100).toFixed(1)}%)</p>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-red-500 h-4 rounded-full"
                    style={{ width: `${predictionData.probability_class_0 * 100}%` }}
                  />
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