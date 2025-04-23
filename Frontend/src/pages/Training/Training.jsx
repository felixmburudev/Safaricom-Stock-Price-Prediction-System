import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/Tr_Styles.css';
import TrainingComponent from '../../components/Training/TrainingComponent';
import TrainingManyComponent from '../../components/Training/TrainingManyComponent';

function Training() {
  const [activeTab, setActiveTab] = useState('single');

  const handleTabChange = (tab) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  };

  return (
    <div className="training">
      <h2 className="training-title">Train a Model</h2>

      {/* Tab Headers */}
      <div className="tabs-container">
        <div
          className={`tab-button ${activeTab === 'single' ? 'active' : ''}`}
          onClick={() => handleTabChange('single')}
        >
          Single Model
        </div>
        <div
          className={`tab-button ${activeTab === 'batch' ? 'active' : ''}`}
          onClick={() => handleTabChange('batch')}
        >
          Batch Training
        </div>
      </div>

      {/* Animated Content */}
      <div className="tab-panel">
        <AnimatePresence mode="wait">
          {activeTab === 'single' && (
            <motion.div
              key="single"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 30, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TrainingComponent />
            </motion.div>
          )}
          {activeTab === 'batch' && (
            <motion.div
              key="batch"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TrainingManyComponent />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Training;
