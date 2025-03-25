import React, { useState, useEffect } from 'react';
import '../../styles/Tr_Styles.css'; // Assuming styles are in AppStyles.css

function Training() {
  const [stockData, setStockData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSavedStockData = async () => {
      try {
        const response = await fetch('http://localhost:8000/saved-stock-data/');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Network response was not ok');
        }
        
        const data = await response.json();
        setStockData(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching saved stock data:', error);
        setStockData([]);
        setError(error.message);
      }
    };

    fetchSavedStockData();
  }, []);

  return (
    <div className="training">
      <h2>Training Data - Saved Stock Data</h2>
      
      {error ? (
        <p className="error-message">{error}</p>
      ) : stockData.length > 0 ? (
        <div className="mini-table-container">
          <table className="mini-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Open (KES)</th>
                <th>High (KES)</th>
                <th>Low (KES)</th>
                <th>Close (KES)</th>
                <th>Volume (Shares)</th>
                <th>Tomorrow (KES)</th>
                <th>Target (KES)</th>
              </tr>
            </thead>
            <tbody>
              {stockData.slice(-10).map((record, index) => (
                <tr key={index}>
                  <td>{record.date}</td>
                  <td>{record.open_price.toFixed(2)}</td>
                  <td>{record.high_price.toFixed(2)}</td>
                  <td>{record.low_price.toFixed(2)}</td>
                  <td>{record.close_price.toFixed(2)}</td>
                  <td>{record.volume.toLocaleString()}</td>
                  <td>{record.tomorrow ? record.tomorrow.toFixed(2) : 'N/A'}</td>
                  <td>{record.target ? record.target.toFixed(2) : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="loading">Loading saved stock data...</p>
      )}
    </div>
  );
}

export default Training;