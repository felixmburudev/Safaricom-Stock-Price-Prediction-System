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
  const [companyData, setCompanyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [error, setError] = useState(null);
  const [companyError, setCompanyError] = useState(null);

  // Polygon.io API key (replace with your own)
  const POLYGON_API_KEY = 'EYYzOPgbR0i2T9W_CmvyrDOLl0B9tEKP'; // Sign up at https://polygon.io to get a free API key

  // Fetch stock data
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

  // Fetch company data from Polygon.io
  useEffect(() => {
    if (!ticker) return;

    const fetchCompanyData = async () => {
      setCompanyLoading(true);
      setCompanyError(null);

      try {
        const response = await axios.get(
          `https://api.polygon.io/v3/reference/tickers/${ticker}?apiKey=${POLYGON_API_KEY}`
        );
        console.log('Company Data Response:', response.data);
        setCompanyData(response.data.results);
      } catch (err) {
        console.error('Error fetching company data:', err);
        setCompanyError('Failed to load company information');
      } finally {
        setCompanyLoading(false);
      }
    };

    fetchCompanyData();
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
    <div style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '20px'
      }}>Stock Price Prediction</h2>

      {!urlTicker && (
        <div>
          <label htmlFor="ticker-input">Select Company: </label>
          <select
            id="ticker-input"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            style={{
              padding: '5px',
              marginBottom: '10px'
            }}
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

      <div style={{
        marginBottom: '10px'
      }}>
        {companyLoading && <p style={{ color: '#6b7280' }}>Loading company data...</p>}
        {companyError && <p style={{ color: '#dc2626' }}>{companyError}</p>}
        {companyData && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            {companyData.branding?.logo_url && (
              <img
                src={companyData.branding.logo_url}
                alt={`${companyData.name} Logo`}
                style={{
                  maxWidth: '100px',
                  height: 'auto'
                }}
              />
            )}
            <div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '5px'
              }}>
                {companyData.name} ({ticker})
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#4b5563',
                lineHeight: '1.5'
              }}>
                {companyData.description || 'No description available'}
              </p>
            </div>
          </div>
        )}
        {!companyData && !companyLoading && !companyError && (
          <h3 style={{
            fontSize: '20px',
            marginBottom: '10px'
          }}>{ticker}</h3>
        )}
      </div>

      <PredictionButton onPredict={handlePredict} />

      {isLoading && <p style={{ color: '#6b7280' }}>Loading...</p>}
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      <div style={{ marginTop: '20px' }}>
        {predictionData && (
          <div style={{
            marginBottom: '20px'
          }}>
            <p style={{
              fontSize: '18px'
            }}>
              Prediction:{' '}
              <strong style={{
                color: predictionData.prediction === 1 ? '#16a34a' : '#dc2626'
              }}>
                {predictionData.prediction === 1 ? 'Price will rise' : 'Price will fall'}
              </strong>
            </p>

            <div style={{
              marginTop: '20px'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600'
              }}>Prediction Confidence</h4>
              <div style={{
                marginTop: '10px'
              }}>
                <p>Price will rise ({(predictionData.probability_class_1 * 100).toFixed(1)}%)</p>
                <div style={{
                  width: '100%',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '9999px',
                  height: '16px'
                }}>
                  <div
                    style={{
                      backgroundColor: '#22c55e',
                      height: '16px',
                      borderRadius: '9999px',
                      width: `${predictionData.probability_class_1 * 100}%`
                    }}
                  />
                </div>
              </div>
              <div style={{
                marginTop: '10px'
              }}>
                <p>Price will fall ({(predictionData.probability_class_0 * 100).toFixed(1)}%)</p>
                <div style={{
                  width: '100%',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '9999px',
                  height: '16px'
                }}>
                  <div
                    style={{
                      backgroundColor: '#ef4444',
                      height: '16px',
                      borderRadius: '9999px',
                      width: `${predictionData.probability_class_0 * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {chartData ? (
          <div style={{
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          !isLoading && <p style={{ color: '#6b7280' }}>No stock data available</p>
        )}
      </div>
    </div>
  );
}

export default Prediction;