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
  const [tickerFound, setTickerFound] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [stockTableData, setStockTableData] = useState(null); // <-- New: Full stock data
  const [loading, setLoading] = useState(false);
  const [gainersLosersLoading, setGainersLosersLoading] = useState(true);
  const [showCompanies, setShowCompanies] = useState(false);

  useEffect(() => {
    const fetchTopStocks = async () => {
      setGainersLosersLoading(true);
      try {
        const API_KEY = 'YOUR_API_KEY';
        const response = await fetch(
          `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${API_KEY}`
        );

        if (!response.ok) throw new Error('Failed to fetch Top Gainers/Losers');

        const data = await response.json();
        if (!data.top_gainers || !data.top_losers) throw new Error('Missing data');

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
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch stock data');

      const data = await response.json();

      if (!data.dates || !data.prices) {
        throw new Error('Invalid data format: missing dates or prices');
      }

      setChartData({
        labels: data.dates,
        datasets: [
          {
            label: `${ticker.toUpperCase()} Closing Price`,
            data: data.prices,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1,
            fill: false,
          },
        ],
      });

      // Set full stock data for table
      const fullData = data.dates.map((date, idx) => ({
        date,
        open: data.opens[idx],
        high: data.highs[idx],
        low: data.lows[idx],
        close: data.prices[idx],
        volume: data.volumes[idx],
      }));

      setStockTableData(fullData);

    } catch (err) {
      setError('Failed to load stock data: ' + err.message);
      setChartData(null);
      setStockTableData(null);
    } finally {
      setLoading(false);
    }
  };

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
      <p className='wl_para'>Welcome to our Stock Price Prediction System...</p>

      {error && <p className="error">{error}</p>}

      {/* Search Section */}
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
        >
          {showCompanies ? 'Hide Companies' : 'Show Companies'}
        </button>
        <button onClick={handleSearch} disabled={loading} className="search-button">
          {loading ? 'Loading...' : 'View Stock Data'}
        </button>
        <div className="ticker-status">
          {tickerFound === true && <span className="ticker-found">Ticker Found: {ticker}</span>}
          {tickerFound === false && ticker && <span className="ticker-not-found">No Ticker Found</span>}
        </div>
      </div>

      {/* Companies List */}
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

      {/* Chart Section */}
      {chartData && (
        <div className="chart-section">
          <h2>Historical Closing Prices for {ticker}</h2>
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Stock Closing Prices' },
                tooltip: { mode: 'index', intersect: false },
              },
              scales: {
                y: {
                  beginAtZero: false,
                  title: { display: true, text: 'Price ($)' },
                },
                x: {
                  title: { display: true, text: 'Date' },
                },
              },
              hover: { mode: 'nearest', intersect: true },
            }}
          />
        </div>
      )}

      {stockTableData && (
        <div className="table-section">
          <h2>Stock Data Table for {ticker}</h2>
          <table className="stock-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Open</th>
                <th>High</th>
                <th>Low</th>
                <th>Close</th>
                <th>Volume</th>
              </tr>
            </thead>
            <tbody>
              {stockTableData.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.date}</td>
                  <td>${row.open.toFixed(2)}</td>
                  <td>${row.high.toFixed(2)}</td>
                  <td>${row.low.toFixed(2)}</td>
                  <td>${row.close.toFixed(2)}</td>
                  <td>{row.volume.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
                <SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow />
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
              <tr><td colSpan="3">No gainers data available</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Top Losers */}
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
                <SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow />
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
              <tr><td colSpan="3">No losers data available</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HomePage;
