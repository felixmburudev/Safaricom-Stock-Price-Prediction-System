// src/components/StockChart/StockChart.js
import React, { useState, useMemo } from 'react';
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
  const [zoom, setZoom] = useState('1Y');

  // Filter data based on zoom level (1M, 3M, 1Y)
  const filteredData = useMemo(() => {
    if (!stockData || !stockData.dates || !stockData.prices || !stockData.volumes) {
      return { dates: [], prices: [], volumes: [] };
    }

    const today = new Date();
    let startDate;

    if (zoom === '1M') {
      startDate = new Date(today.setMonth(today.getMonth() - 1));
    } else if (zoom === '3M') {
      startDate = new Date(today.setMonth(today.getMonth() - 3));
    } else {
      startDate = new Date(today.setFullYear(today.getFullYear() - 1));
    }

    return stockData.dates.reduce(
      (acc, date, index) => {
        const currentDate = new Date(date);
        if (currentDate >= startDate) {
          acc.dates.push(date);
          acc.prices.push(Number(stockData.prices[index])); // Ensure number
          acc.volumes.push(Number(stockData.volumes[index])); // Ensure number
        }
        return acc;
      },
      { dates: [], prices: [], volumes: [] }
    );
  }, [zoom, stockData]);

  // Price chart data
  const priceData = {
    labels: filteredData.dates,
    datasets: [
      {
        label: 'Stock Price',
        data: filteredData.prices,
        borderColor: '#00a86b',
        backgroundColor: 'rgba(0, 168, 107, 0.3)',
        tension: 0.1,
        fill: true,
        pointRadius: 0, // Remove points for cleaner line
      },
    ],
  };

  // Volume chart data
  const volumeData = {
    labels: filteredData.dates,
    datasets: [
      {
        label: 'Volume',
        data: filteredData.volumes, // Fixed typo here
        backgroundColor: 'rgba(0, 168, 107, 0.5)',
        borderColor: '#00a86b',
        type: 'bar',
      },
    ],
  };

  // Shared chart options
  const sharedOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow custom height
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          maxTicksLimit: 10, // Limit number of x-axis labels for readability
        },
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        beginAtZero: false,
      },
    },
  };

  // Price chart options
  const priceOptions = {
    ...sharedOptions,
    plugins: {
      ...sharedOptions.plugins,
      title: {
        display: true,
        text: 'Stock Price History',
        color: 'var(--secondary-color)',
        font: { size: 20, weight: 'bold' },
      },
    },
    scales: {
      ...sharedOptions.scales,
      y: {
        ...sharedOptions.scales.y,
        title: { display: true, text: 'Price (USD)' },
        ticks: {
          callback: (value) => `$${value.toFixed(2)}`, // Format as USD
        },
      },
    },
  };

  // Volume chart options
  const volumeOptions = {
    ...sharedOptions,
    plugins: {
      ...sharedOptions.plugins,
      title: {
        display: true,
        text: 'Trading Volume',
        color: 'var(--secondary-color)',
        font: { size: 16, weight: 'bold' },
      },
    },
    scales: {
      ...sharedOptions.scales,
      y: {
        ...sharedOptions.scales.y,
        title: { display: true, text: 'Volume (Shares)' },
        ticks: {
          callback: (value) => `${(value / 1000000).toFixed(1)}M`, // Format as millions
        },
      },
    },
  };

  // Check if data is valid
  if (!stockData || !filteredData.dates.length) {
    return <div>No chart data available</div>;
  }

  return (
    <div className="stock-chart-container">
      <div className="zoom-controls">
        {['1M', '3M', '1Y'].map((range) => (
          <button
            key={range}
            onClick={() => setZoom(range)}
            className={zoom === range ? 'active' : ''}
          >
            {range}
          </button>
        ))}
      </div>

      <div className="stock-chart" style={{ height: '400px' }}>
        <Line data={priceData} options={priceOptions} />
      </div>

      <div className="volume-chart" style={{ height: '200px' }}>
        <Line data={volumeData} options={volumeOptions} />
      </div>

      <div className="stock-info">
        <h3>Stock Information</h3>
        <p>
          <strong>Price High:</strong> ${stockData.price_high.toFixed(2)}
        </p>
        <p>
          <strong>Price Low:</strong> ${stockData.price_low.toFixed(2)}
        </p>
        <p>
          <strong>Average Volume:</strong>{' '}
          {Math.round(stockData.avg_volume).toLocaleString()} shares
        </p>
      </div>
    </div>
  );
}

export default StockChart;