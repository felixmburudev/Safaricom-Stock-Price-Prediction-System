import React, { useEffect, useState } from 'react';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';


const HomePage = () => {
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [ticker, setTicker] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopStocks = async () => {
      try {
        // Alpha Vantage API key
        const API_KEY = 'API_KEY'; 
  
        // Fetch top gainers
        const gainersResponse = await fetch(
          `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${API_KEY}`
        );
        const data = await gainersResponse.json();
  
        // Process top 5 gainers
        const gainers = data.top_gainers.slice(0, 5).map(stock => ({
          name: stock.ticker, // Alpha Vantage doesn't provide shortName, using ticker
          symbol: stock.ticker,
          price: parseFloat(stock.price),
          change: `${parseFloat(stock.change_percentage).toFixed(2)}%`
        }));
  
        // Process top 5 losers
        const losers = data.top_losers.slice(0, 5).map(stock => ({
          name: stock.ticker,
          symbol: stock.ticker,
          price: parseFloat(stock.price),
          change: `${parseFloat(stock.change_percentage).toFixed(2)}%`
        }));
  
        setGainers(gainers);
        setLosers(losers);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    };
  
    fetchTopStocks();
  }, []);
  
  const validateTicker = async (symbol) => {
    try {
      const res = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`);
      const data = await res.json();

      if (
        data.quoteResponse &&
        data.quoteResponse.result &&
        data.quoteResponse.result.length > 0 &&
        data.quoteResponse.result[0].symbol.toUpperCase() === symbol.toUpperCase()
      ) {
        return true;
      }

      return false;
    } catch (err) {
      console.error("Error checking ticker:", err);
      return false;
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const symbol = ticker.trim().toUpperCase();
    if (!symbol) return;

    const isValid = await validateTicker(symbol);
    if (isValid) {
      setError('');
      navigate(`/training/${symbol}`);
    } else {
      setError('Invalid company symbol. Please try again.');
    }
  };


  const handlePredict = () => {
  };

  return (
    <div className="container">
      <h1 className="main-heading">Stock Prediction Dashboard</h1>
      <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter company symbol (e.g. AAPL)"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
        />
        <button type="submit">Train</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
     
      {/* Ticker Tape */}
      <div className="ticker-tape">
        {gainers.concat(losers).map((stock, index) => (
          <span key={index}>{stock.symbol}: ${stock.price} {stock.change.includes('+') ? '▲' : '▼'} | </span>
        ))}
      </div>

    

      <div className="section">
        <h2 className="section-heading green">Top Gainers Today</h2>
        <table className="stock-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Symbol</th>
              <th>Price ($)</th>
              <th>% Change</th>
            </tr>
          </thead>
          <tbody>
            {gainers.map((stock, index) => (
              <tr key={index}>
                <td>{stock.name}</td>
                <td>{stock.symbol}</td>
                <td>{stock.price.toFixed(2)}</td>
                <td className="green_text">+ {stock.change}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section">
        <h2 className="section-heading red">Top Losers Today</h2>
        <table className="stock-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Symbol</th>
              <th>Price ($)</th>
              <th>% Change</th>
            </tr>
          </thead>
          <tbody>
            {losers.map((stock, index) => (
              <tr key={index}>
                <td>{stock.name}</td>
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
