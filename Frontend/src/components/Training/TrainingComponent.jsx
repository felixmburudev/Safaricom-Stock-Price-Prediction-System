import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Training_styles.css';
import companies from "./companies"
import { useNavigate } from 'react-router-dom';
const TrainingComponent = () => {
    const [progress, setProgress] = useState({ stage: 'Not started', percentage: 0 });
    const [isTraining, setIsTraining] = useState(false);
    const [ticker, setTicker] = useState('');
    const navigate = useNavigate();
    useEffect(() => {
        let interval;

        if (isTraining) {
            let percentage = 0;
            setProgress({ stage: 'Fetching data', percentage: 0 });
            
            interval = setInterval(() => {
                percentage += 1;
                setProgress((prev) => {
                    if (prev.stage === 'Fetching data' && percentage <= 25) {
                        return { stage: 'Fetching data', percentage };
                    }
                    if (percentage > 25 && percentage <= 50) {
                        return { stage: 'Cleaning and modifying data', percentage };
                    }
                    if (percentage > 50 && percentage <= 75) {
                        return { stage: 'Training model', percentage };
                    }
                    if (percentage > 75 && percentage < 100) {
                        return { stage: 'Saving model', percentage };
                    }
                    if (percentage >= 100) {
                        clearInterval(interval);
                        setIsTraining(false);
                        return { stage: 'Training complete', percentage: 100 };
                    }
                    return prev;
                });
            }, 200);
        }

        return () => clearInterval(interval);
    }, [isTraining]);

   
    const handleTrain = async () => {
        if (!isTraining && ticker.trim() !== '') {
            setIsTraining(true);
            setProgress({ stage: 'Initializing...', percentage: 0 });
    
            try {
                const response = await fetch(`http://localhost:8000/train/?ticker=${encodeURIComponent(ticker)}`, {
                    method: 'GET',
                });
    
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }
    
                setProgress({ stage: 'Fetching data', percentage: 0 });
                setTimeout(() => {
                    setProgress({ stage: 'Training complete', percentage: 100 });
                    navigate(`/predict/${ticker}`);
                }, 17000); 
            } catch (error) {
                console.error('Error starting training:', error);
                setIsTraining(false);
                setProgress({ stage: 'Error occurred', percentage: 0 });
            }
        }
    };
    
  
    const handleTickerChange = (event) => {
        setTicker(event.target.value);
    };
    
    return (
        <div className="training-container">
            <div>
        <label htmlFor="ticker-input">Select Company: </label>
        <select
            id="ticker-input"
            value={ticker}
            onChange={handleTickerChange}
            disabled={isTraining}
        >
            <option value="">Select a company</option>
            {companies.map((company) => (
                <option key={company.symbol} value={company.symbol}>
                    {company.name} ({company.symbol})
                </option>
            ))}
        </select>
    </div>
            <button onClick={handleTrain} disabled={isTraining || ticker.trim() === ''}>
                {isTraining ? 'Training...' : 'Start Training'}
            </button>
            <div className="progress-bar-container">
                <div
                    className="progress-bar"
                    style={{ width: `${progress.percentage}%` }}
                ></div>
            </div>
            <p>Stage: {progress.stage}</p>
            <p>Progress: {progress.percentage}%</p>
        </div>
    );
};

export default TrainingComponent;
