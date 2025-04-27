import React, { useEffect, useState } from 'react';
import './HomePage.css';
import '../../styles/AppStyles.css';
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
import companies from '../../components/Training/companies';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const HomePage = () => {
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [error, setError] = useState('');
  const [ticker, setTicker] = useState('');
  const [tickerFound, setTickerFound] = useState(null); // null, true, or false
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gainersLosersLoading, setGainersLosersLoading] = useState(true); // New loading state
  const [showCompanies, setShowCompanies] = useState(false);

  useEffect(() => {
    const fetchTopStocks = async () => {
      setGainersLosersLoading(true);
      try {
        const API_KEY = 'YOUR_API_KEY'; // Replace with your Alpha Vantage API key
        const response = await fetch(
          `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${API_KEY}`
        );

        if (!response.ok) {
          const text = await response.text();
          console.error('Top Gainers/Losers API error:', response.status, text);
          throw new Error(`HTTP ${response.status}: ${text.slice(0, 100)}...`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response:', text.slice(0, 200));
          throw new Error('Expected JSON, got: ' + text.slice(0, 100) + '...');
        }

        const data = await response.json();
        console.log('Top Gainers/Losers data:', data);

        if (data.Information || data.Error) {
          throw new Error(data.Information || data.Error || 'Invalid API response');
        }

        if (!data.top_gainers || !data.top_losers) {
          throw new Error('Missing top_gainers or top_losers in response');
        }

        const processStocks = (stocks) =>
          stocks.slice(0, 5).map((stock) => ({
            name: stock.ticker,
            symbol: stock.ticker,
            price: parseFloat(stock.price) || 0,
            change: `${parseFloat(stock.change_percentage || 0).toFixed(2)}%`,
          }));

        setGainers(processStocks(data.top_gainers));
        setLosers(processStocks(data.top_losers));
        setError('');
      } catch (err) {
        console.error('Error fetching market movers:', err);
        setError('Failed to load Top Gainers and Losers: ' + err.message);
        setGainers([]);
        setLosers([]);
      } finally {
        setGainersLosersLoading(false);
      }
    };

    fetchTopStocks();
  }, []);

  const validateTicker = (inputTicker) => {
    const found = companies.find(
      (company) => company.symbol.toUpperCase() === inputTicker.toUpperCase()
    );
    setTickerFound(!!found);
    return !!found;
  };

  const handleTickerChange = (e) => {
    const newTicker = e.target.value.toUpperCase();
    setTicker(newTicker);
    if (newTicker) {
      validateTicker(newTicker);
    } else {
      setTickerFound(null);
    }
  };

  const handleCompanySelect = (symbol) => {
    setTicker(symbol);
    setTickerFound(true);
    setShowCompanies(false);
  };

  const toggleCompaniesList = () => {
    setShowCompanies((prev) => !prev);
  };

  const handleSearch = async () => {
    if (!ticker.trim()) {
      setError('Please enter a valid ticker symbol');
      setTickerFound(false);
      return;
    }

    if (!validateTicker(ticker)) {
      setError('Invalid ticker symbol');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `http://localhost:8000/stock_data?ticker=${encodeURIComponent(ticker)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers));

      if (!response.ok) {
        const text = await response.text();
        console.error('Non-OK response:', response.status, text.slice(0, 200));
        throw new Error(`Server returned ${response.status}: ${text.slice(0, 100)}...`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.slice(0, 200));
        throw new Error('Expected JSON, got: ' + text.slice(0, 100) + '...');
      }

      const data = await response.json();
      console.log('Received data:', data);

      if (!data.dates || !data.prices) {
        console.error('Invalid data format:', data);
        throw new Error('Invalid data format: missing dates or prices');
      }

      const labels = data.dates;
      const prices = data.prices;

      setChartData({
        labels,
        datasets: [
          {
            label: `${ticker.toUpperCase()} Closing Price`,
            data: prices,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1,
            fill: false,
          },
        ],
      });
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError('Failed to load stock data: ' + err.message);
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  // Skeleton Loader Component
  const SkeletonRow = () => (
    <tr>
      <td><div className="skeleton skeleton-cell"></div></td>
      <td><div className="skeleton skeleton-cell"></div></td>
      <td><div className="skeleton skeleton-cell"></div></td>
    </tr>
  );

  return (
    <div className="container">
      <h1 className="main-heading">Stock Dashboard</h1>

      {error && <p className="error">{error}</p>}

      {/* Search Input, Companies Button, and Ticker Status */}
      <div className="search-section">
        <input
          type="text"
          value={ticker}
          onChange={handleTickerChange}
          placeholder="Enter stock ticker (e.g., AAPL)"
          className="search-input"
        />
        <button
          onClick={toggleCompaniesList}
          className="companies-button"
          title="Show company list"
        >
          {showCompanies ? 'Hide Companies' : 'Show Companies'}
        </button>
        <button onClick={handleSearch} disabled={loading} className="search-button">
          {loading ? 'Loading...' : 'View Stock Data'}
        </button>
        <div className="ticker-status">
          {tickerFound === true && (
            <span className="ticker-found">Ticker Found: {ticker}</span>
          )}
          {tickerFound === false && ticker && (
            <span className="ticker-not-found">No Ticker Found</span>
          )}
        </div>
      </div>

      {/* Companies List Dropdown */}
      {showCompanies && (
        <div className="companies-list">
          <h3>Available Companies</h3>
          <ul>
            {companies.map((company, index) => (
              <li
                key={index}
                onClick={() => handleCompanySelect(company.symbol)}
                className="company-item"
              >
                {company.name} ({company.symbol})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Line Chart */}
      {chartData && (
        <div className="chart-section">
          <h2>Historical Closing Prices for {ticker}</h2>
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Stock Closing Prices',
                },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: false,
                  title: {
                    display: true,
                    text: 'Price ($)',
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: 'Date',
                  },
                },
              },
              hover: {
                mode: 'nearest',
                intersect: true,
              },
            }}
          />
        </div>
      )}

      <div className="ticker-tape">
        {gainers.concat(losers).map((stock, index) => (
          <span key={index}>
            {stock.symbol}: ${stock.price.toFixed(2)}{' '}
            {stock.change.includes('-') ? '▼' : '▲'} |
          </span>
        ))}
      </div>

      <div className="section">
        <h2 className="section-heading green">Top Gainers</h2>
        <table className="stock-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Price</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {gainersLosersLoading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : gainers.length > 0 ? (
              gainers.map((stock, index) => (
                <tr key={index}>
                  <td>{stock.symbol}</td>
                  <td>${stock.price.toFixed(2)}</td>
                  <td className="green_text">{stock.change}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="no-data">
                  No gainers data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="section">
        <h2 className="section-heading red">Top Losers</h2>
        <table className="stock-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Price</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {gainersLosersLoading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : losers.length > 0 ? (
              losers.map((stock, index) => (
                <tr key={index}>
                  <td>{stock.symbol}</td>
                  <td>${stock.price.toFixed(2)}</td>
                  <td className="red_text">{stock.change}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="no-data">
                  No losers data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HomePage;