import React, { useEffect, useState } from 'react';
import './HomePage.css';
import axios from 'axios';
import StockChart from '../../components/StockChart/StockChart';
import '../../styles/AppStyles.css';

const HomePage = () => {
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [ticker, setTicker] = useState('');
  const [error, setError] = useState('');
  const [stockData, setStockData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch top gainers and losers (keeping this lean, like a SpaceX rocket)
  useEffect(() => {
    const fetchTopStocks = async () => {
      try {
        const API_KEY = 'YOUR_API_KEY'; // Replace with your Alpha Vantage key
        const response = await fetch(
          `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${API_KEY}`
        );
        const data = await response.json();

        const processStocks = (stocks) =>
          stocks.slice(0, 5).map((stock) => ({
            name: stock.ticker,
            symbol: stock.ticker,
            price: parseFloat(stock.price),
            change: `${parseFloat(stock.change_percentage).toFixed(2)}%`,
          }));

        setGainers(processStocks(data.top_gainers || []));
        setLosers(processStocks(data.top_losers || []));
      } catch (err) {
        console.error('Error fetching market movers:', err);
        setError('Failed to load market data. Hang tight!');
      }
    };

    fetchTopStocks();
  }, []);

  // Handle ticker search with max reliability
  const handleSubmit = async (e) => {
    e.preventDefault();
    const symbol = ticker.trim().toUpperCase();
    if (!symbol) {
      setError('Enter a ticker symbol, like TSLA or AAPL!');
      return;
    }

    setIsLoading(true);
    setError('');
    setStockData(null); // Clear previous data for a fresh start

    try {
      const response = await axios.get(`http://localhost:8000/stock_data?ticker=${symbol}`);
      const { stock_data } = response.data;
      alert(JSON.stringify(response.data)); 
        setStockData(stock_data);
      // } else {
      //   setError(`No data found for ${symbol}. Try another ticker!`);
      // }
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError('Whoops! Couldn’t fetch data for that ticker.');
    } finally {
      setIsLoading(false);
    }
  };

  // Slice recent data for the table (10 rows, like a Falcon 10... kidding!)
  const getRecentData = (data, numRows = 10) => {
    if (!data || !data.dates) return null;
    const startIndex = Math.max(0, data.dates.length - numRows);
    return {
      dates: data.dates.slice(startIndex),
      prices: data.prices.slice(startIndex),
      opens: data.opens.slice(startIndex),
      highs: data.highs.slice(startIndex),
      lows: data.lows.slice(startIndex),
      volumes: data.volumes.slice(startIndex),
    };
  };

  const recentData = stockData ? getRecentData(stockData) : null;

  return (
    <div className="container">
      <h1 className="main-heading">Stock Dashboard: Conquer the Market!</h1>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          placeholder="Enter ticker (e.g., TSLA)"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          className="ticker-input"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Go!'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}

      {/* Stock Data Section */}
      {stockData && recentData ? (
        <div className="stock-section">
          <h2>{stockData.name || stockData.symbol} Stock Data</h2>

          {/* Table */}
          <div className="stock-table-container">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Open ($)</th>
                  <th>High ($)</th>
                  <th>Low ($)</th>
                  <th>Close ($)</th>
                  <th>Volume</th>
                </tr>
              </thead>
              <tbody>
                {recentData.dates.map((date, index) => (
                  <tr key={date}>
                    <td>{date}</td>
                    <td>{recentData.opens[index].toFixed(2)}</td>
                    <td>{recentData.highs[index].toFixed(2)}</td>
                    <td>{recentData.lows[index].toFixed(2)}</td>
                    <td>{recentData.prices[index].toFixed(2)}</td>
                    <td>{recentData.volumes[index].toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Chart */}
          <div className="stock-chart-container">
            <StockChart stockData={stockData} />
          </div>
        </div>
      ) : isLoading ? (
        <p className="loading">Fetching data faster than a Starship launch...</p>
      ) : (
        !error && <p className="placeholder">Search a ticker to see the magic!</p>
      )}

      {/* Ticker Tape */}
      <div className="ticker-tape">
        {gainers.concat(losers).map((stock, index) => (
          <span key={index}>
            {stock.symbol}: ${stock.price.toFixed(2)} {stock.change.includes('-') ? '▼' : '▲'} |
          </span>
        ))}
      </div>

      {/* Top Gainers */}
      <div className="section">
        <h2 className="section-heading green">Top Gainers: Skyrocketing!</h2>
        <table className="stock-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Price ($)</th>
              <th>% Change</th>
            </tr>
          </thead>
          <tbody>
            {gainers.map((stock, index) => (
              <tr key={index}>
                <td>{stock.symbol}</td>
                <td>{stock.price.toFixed(2)}</td>
                <td className="green_text">+{stock.change}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top Losers */}
      <div className="section">
        <h2 className="section-heading red">Top Losers: Course Correction</h2>
        <table className="stock-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Price ($)</th>
              <th>% Change</th>
            </tr>
          </thead>
          <tbody>
            {losers.map((stock, index) => (
              <tr key={index}>
                <td>{stock.symbol}</td>
                <td>{stock.price.toFixed(2)}</td>
                <td className="red_text">{stock.change}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HomePage;