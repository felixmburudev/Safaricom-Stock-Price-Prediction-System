import React, { useState, useEffect } from 'react';
import './Training_styles.css';
import { useNavigate } from 'react-router-dom';
import companies from './companies';

const TrainingComponent = () => {
    const [progress, setProgress] = useState({ stage: 'Not started', percentage: 0 });
    const [isTraining, setIsTraining] = useState(false);
    const [ticker, setTicker] = useState('');
    const [nEstimators, setNEstimators] = useState(100);
    const [maxDepth, setMaxDepth] = useState(10);
    const [randomState, setRandomState] = useState(42);
    const [startDate, setStartDate] = useState("2000-01-01");
    const [endDate, setEndDate] = useState("2025-03-31");
    const navigate = useNavigate();

    useEffect(() => {
        let interval;

        if (isTraining) {
            let percentage = 0;
            setProgress({ stage: 'Fetching data', percentage: 0 });

            interval = setInterval(() => {
                percentage += 1;
                setProgress((prev) => {
                    if (percentage <= 25) return { stage: 'Fetching data', percentage };
                    if (percentage <= 50) return { stage: 'Cleaning and modifying data', percentage };
                    if (percentage <= 75) return { stage: 'Training model', percentage };
                    if (percentage < 100) return { stage: 'Saving model', percentage };
                    clearInterval(interval);
                    setIsTraining(false);
                    return { stage: 'Training complete', percentage: 100 };
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
                const response = await fetch(`http://localhost:8000/train/?ticker=${encodeURIComponent(ticker)}&n_estimators=${nEstimators}&max_depth=${maxDepth}&random_state=${randomState}&start_date=${startDate}&end_date=${endDate}`, {
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
            <h2>Single Model Training</h2>

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

            <div className="model-params">
                <label>
                    n_estimators (10–500):
                    <input
                        type="number"
                        min={10}
                        max={500}
                        value={nEstimators}
                        onChange={(e) => setNEstimators(parseInt(e.target.value))}
                        disabled={isTraining}
                    />
                </label>

                <label>
                    max_depth (1–50):
                    <input
                        type="number"
                        min={1}
                        max={50}
                        value={maxDepth}
                        onChange={(e) => setMaxDepth(parseInt(e.target.value))}
                        disabled={isTraining}
                    />
                </label>

                <label>
                    random_state (0–9999):
                    <input
                        type="number"
                        min={0}
                        max={9999}
                        value={randomState}
                        onChange={(e) => setRandomState(parseInt(e.target.value))}
                        disabled={isTraining}
                    />
                </label>

                <label>
                    Start Date:
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={isTraining}
                    />
                </label>

                <label>
                    End Date:
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={isTraining}
                    />
                </label>
            </div>

            <button onClick={handleTrain} disabled={isTraining || ticker.trim() === ''}>
                {isTraining ? 'Training...' : 'Start Training'}
            </button>

            <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${progress.percentage}%` }}></div>
            </div>

            <p>Stage: {progress.stage}</p>
            <p>Progress: {progress.percentage}%</p>
        </div>
    );
};

export default TrainingComponent;
