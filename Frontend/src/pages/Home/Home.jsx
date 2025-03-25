// src/pages/Home/Home.jsx
import React, { useState, useEffect } from 'react';
import StockChart from '../../components/StockChart/StockChart';
import '../../styles/AppStyles.css';

function Home() {
  const [stockData, setStockData] = useState(null);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await fetch('http://localhost:8000/safaricom-stock-data/');
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setStockData(data);
      } catch (error) {
        console.error('Error fetching stock data:', error);
        setStockData(null);
      }
    };

    fetchStockData();
  }, []);

  // Function to get the last N rows of data
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

  const recentData = stockData ? getRecentData(stockData, 10) : null;

  return (
    <div className="home">
      <h2>Safaricom Stock Price Overview</h2>
      
      {stockData ? (
        <>
          {/* Stock Data Table */}
          <div className="stock-table-container">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Open (KES)</th>
                  <th>High (KES)</th>
                  <th>Low (KES)</th>
                  <th>Close (KES)</th>
                  <th>Volume (Shares)</th>
                </tr>
              </thead>
              <tbody>
                {recentData && recentData.dates.map((date, index) => (
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

          {/* Stock Chart */}
          <StockChart stockData={stockData} />
        </>
      ) : (
        <p className="loading">Loading stock data...</p>
      )}
    </div>
  );
}

export default Home;