import React, { useState, useEffect } from 'react';
import '../../styles/AppStyles.css';

const TrainingComponent = () => {
    const [progress, setProgress] = useState({ stage: 'Not started', percentage: 0 });
    const [isTraining, setIsTraining] = useState(false);

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
                        if (prev.stage !== 'Cleaning and modifying data') {
                            return { stage: 'Cleaning and modifying data', percentage: 25 };
                        }
                        return { stage: 'Cleaning and modifying data', percentage };
                    }
                    if (percentage > 50 && percentage <= 75) {
                        if (prev.stage !== 'Training model') {
                            return { stage: 'Training model', percentage: 50 };
                        }
                        return { stage: 'Training model', percentage };
                    }
                    if (percentage > 75 && percentage <= 100) {
                        if (prev.stage !== 'Saving model') {
                            return { stage: 'Saving model', percentage: 75 };
                        }
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

    const handleTrain = () => {
        if (!isTraining) {
            setIsTraining(true);
            setProgress({ stage: 'Fetching data', percentage: 0 });
        }
    };

    const progressWidth = `${progress.percentage}%`;

    return (
        <div className="training-container">
            <button onClick={handleTrain} disabled={isTraining}>
                {isTraining ? 'Training...' : 'Start Training'}
            </button>
            <div className="progress-bar-container">
                <div
                    className="progress-bar"
                    style={{ width: progressWidth }}
                ></div>
            </div>
            <p>Stage: {progress.stage}</p>
            <p>Progress: {progress.percentage}%</p>
        </div>
    );
};

export default TrainingComponent;