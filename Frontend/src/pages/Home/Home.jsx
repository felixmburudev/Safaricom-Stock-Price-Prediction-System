// src/pages/Home/Home.js
import React, { useState, useEffect } from 'react';
import StockChart from '../../components/StockChart/StockChart';
import '../../styles/AppStyles.css';

function Home() {
  const [stockData, setStockData] = useState(null);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        // Using jsonplaceholder as a free, keyless mock API
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const posts = await response.json();
        
        // Mock GOOGL stock data using post IDs and titles
        const today = new Date();
        const dates = [];
        const prices = [];
        
        // Generate 30 days of mock data
        for (let i = 0; i < 30; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          dates.push(date.toISOString().split('T')[0]); // Format as YYYY-MM-DD
          
          // Simulate prices (base price 1500 + random fluctuation)
          const basePrice = 1500;
          const fluctuation = Math.random() * 50 - 25; // +/- 25
          prices.push(basePrice + fluctuation + (i % 5)); // Trend + noise
        }

        setStockData({
          dates: dates.reverse(), // Oldest to newest
          prices: prices.reverse(),
        });
      } catch (error) {
        console.error('Error fetching mock stock data:', error);
        setStockData(null);
      }
    };

    fetchStockData();
  }, []);

  return (
    <div className="home">
      <h2>Safaricom Stock Price </h2>
      {stockData ? (
        <StockChart stockData={stockData} />
      ) : (
        <p className="loading">Loading stock data...</p>
      )}
    </div>
  );
}

export default Home;