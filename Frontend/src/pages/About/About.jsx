import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <h1>About the Stock Price Prediction Systkjhghvem</h1>
      <p>
        The Stock Price Prediction System is a modern web application designed to help investors, researchers, and financial enthusiasts
        make informed decisions by leveraging machine learning to predict future stock prices. Developed using a full-stack approach, the
        system combines the robust capabilities of Django on the backend with the dynamic and responsive UI features of React on the frontend.
      </p>

      <p>
        At the core of the system is a trained machine learning model—specifically, a Random Forest Regressor—that analyzes historical stock data 
        to forecast future price movements. By inputting a valid stock ticker symbol, users can access real-time predictions based on previously 
        learned market patterns. This makes the system highly generalizable and adaptable to any publicly traded company, moving beyond 
        company-specific limitations and providing a scalable, practical tool for a wide variety of financial analysis needs.
      </p>

      <p>
        The platform is designed with accessibility and usability in mind. Whether you're a beginner investor looking to explore market patterns 
        or an experienced analyst testing automated forecasting tools, this system offers an intuitive interface that makes complex computations 
        accessible in just a few clicks. The integration of Django REST APIs ensures that data retrieval and prediction are efficient and secure, 
        while React delivers a smooth and fast front-end experience with real-time updates and clean visualization.
      </p>

      <p>
        In an era where financial data is vast, fast-changing, and difficult to interpret manually, machine learning provides a solution that 
        is not only fast but also adaptive. This project stands at the intersection of finance, data science, and software engineering, 
        demonstrating how technology can transform traditional industries and support smarter decision-making in investment management.
      </p>

      <h2>Key Features</h2>
      <ul className="features-list">
        <li>🔍 Predict stock prices using machine learning (Random Forest model).</li>
        <li>📊 Analyze historical stock data in a clean, interactive format.</li>
        <li>📈 Visualize both past performance and future trends.</li>
        <li>⚙️ Robust Django backend handling data logic and prediction processes.</li>
        <li>💻 Responsive React frontend for a seamless user experience.</li>
        <li>🔄 Real-time data fetching through user input (ticker symbols).</li>
        <li>🌐 Support for any public stock — not limited to one company or industry.</li>
        <li>🔐 Scalable architecture ready for API expansion and user authentication features.</li>
      </ul>

      <p className="note">
        Disclaimer: This system is designed primarily for educational and research purposes. While machine learning can enhance financial forecasting, 
        predictions may not always be accurate due to market unpredictability. Users are encouraged to consult professional financial advisors before making investment decisions.
      </p>
    </div>
  );
};

export default About;
