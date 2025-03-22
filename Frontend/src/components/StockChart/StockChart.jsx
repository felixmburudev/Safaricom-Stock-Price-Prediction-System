// src/components/StockChart/StockChart.js
import React from 'react';
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

function StockChart({ stockData }) {
  const data = {
    labels: stockData?.dates || [],
    datasets: [
      {
        label: 'Safaricom Stock Price',
        data: stockData?.prices || [],
        borderColor: 'var(--primary-color)',
        backgroundColor: 'rgba(0, 168, 107, 0.1)',
        tension: 0.1,
        fill: true,
      },
    ],
  };

  const options = {
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
      },
    },
  };

  return (
    <div className="stock-chart">
      <Line data={data} options={options} />
    </div>
  );
}

export default StockChart;