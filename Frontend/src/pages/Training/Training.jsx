import React, { useState, useEffect } from 'react';
import '../../styles/Tr_Styles.css';
import  TrainingComponent  from '../../components/Training/TrainingComponent';

import PredictionComponent from '../../components/PredictionComponent/PredictionComponent';
function Training() {
  return (
    <div className="training">
      <h2>Training Data  A Model</h2>
      
     <TrainingComponent />
    </div>
  );
}

export default Training;