import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Prediction from './pages/Prediction/Prediction';
import Training from './pages/Training/Training';
import About from './pages/About/About';
import './styles/AppStyles.css';
import Footer from './pages/Footer/Footer';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        <div className="content-wrapper">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/predict/:ticker" element={<Prediction />} /> 
            <Route path="/training" element={<Training />} />
            <Route path="/about" element={<About />} />
            <Route path="/predict" element={<Prediction />} />

          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
