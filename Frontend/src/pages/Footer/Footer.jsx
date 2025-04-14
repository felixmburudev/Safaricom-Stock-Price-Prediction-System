import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} Stock Price Prediction System. All rights reserved.</p>
      <div className="footer-links">
        <a href="/about">About</a>
        <a href="https://github.com/felixmburudev/Safaricom-Stock-Price-Prediction-System/" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a href="/contact">Contact</a>
      </div>
    </footer>
  );
};

export default Footer;
