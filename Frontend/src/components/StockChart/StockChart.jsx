// src/components/StockChart/StockChart.js
import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import '../../styles/AppStyles.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function StockChart({ stockData }) {
  const [zoom, setZoom] = useState('1Y'); // Default to 1 year

  // Filter data based on zoom level
  const filterDataByZoom = (dates, prices, volumes) => {
    const today = new Date();
    let startDate;

    if (zoom === '1M') {
      startDate = new Date(today.setMonth(today.getMonth() - 1));
    } else if (zoom === '3M') {
      startDate = new Date(today.setMonth(today.getMonth() - 3));
    } else {
      startDate = new Date(today.setFullYear(today.getFullYear() - 1)); // 1Y
    }

    const filteredData = { dates: [], prices: [], volumes: [] };
    dates.forEach((date, index) => {
      const currentDate = new Date(date);
      if (currentDate >= startDate) {
        filteredData.dates.push(date);
        filteredData.prices.push(prices[index]);
        filteredData.volumes.push(volumes[index]);
      }
    });

    return filteredData;
  };

  const filteredData = filterDataByZoom(
    stockData.dates,
    stockData.prices,
    stockData.volumes
  );

  // Price chart data
  const priceData = {
    labels: filteredData.dates,
    datasets: [
      {
        label: 'Safaricom Stock Price',
        data: filteredData.prices,
        borderColor: '#00a86b', // Safaricom green
        backgroundColor: 'rgba(0, 168, 107, 0.3)', // Green fill
        tension: 0.1,
        fill: true,
      },
    ],
  };

  // Volume chart data
  const volumeData = {
    labels: filteredData.dates,
    datasets: [
      {
        label: 'Volume',
        data: filteredData.volumes,
        backgroundColor: '#00a86b', // Green bars
        borderColor: '#00a86b',
        type: 'bar',
      },
    ],
  };

  const priceOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Safaricom Stock Price History',
        color: 'var(--secondary-color)',
        font: {
          size: 20,
          weight: 'bold',
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        title: {
          display: true,
          text: 'Price (KES)',
        },
      },
    },
  };

  const volumeOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Volume',
        color: 'var(--secondary-color)',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        title: {
          display: true,
          text: 'Volume',
        },
      },
    },
  };

  return (
    <div className="stock-chart-container">
      {/* Zoom Controls */}
      <div className="zoom-controls">
        <button onClick={() => setZoom('1M')} className={zoom === '1M' ? 'active' : ''}>1M</button>
        <button onClick={() => setZoom('3M')} className={zoom === '3M' ? 'active' : ''}>3M</button>
        <button onClick={() => setZoom('1Y')} className={zoom === '1Y' ? 'active' : ''}>1Y</button>
      </div>

      {/* Price Chart */}
      <div className="stock-chart">
        <Line data={priceData} options={priceOptions} />
      </div>

      {/* Volume Chart */}
      <div className="volume-chart">
        <Line data={volumeData} options={volumeOptions} />
      </div>

     
      <div className="stock-info">
        <h3>Stock Information</h3>
        <p><strong>Price High:</strong> {stockData.price_high.toFixed(2)} KES</p>
        <p><strong>Price Low:</strong> {stockData.price_low.toFixed(2)} KES</p>
        <p><strong>Average Volume:</strong> {Math.round(stockData.avg_volume).toLocaleString()} shares</p>
      </div>
    </div>
  );
}

export default StockChart;