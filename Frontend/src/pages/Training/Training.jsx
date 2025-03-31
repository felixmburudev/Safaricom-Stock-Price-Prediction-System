import React, { useState, useEffect } from 'react';
import '../../styles/Tr_Styles.css';
import  TrainingComponent  from '../../components/Training/TrainingComponent';

function Training() {
  return (
    <div className="training">
      <h2>Training Data - Saved Stock Data</h2>
      
     <TrainingComponent />
    </div>
  );
}

export default Training;