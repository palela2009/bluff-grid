import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p className="footer-text">
          Created by <span className="creator-name">Alexander Palelashvili</span>
        </p>
        <p className="footer-subtext">Born June 26, 2009 • 2025</p>
      </div>
    </footer>
  );
};

export default Footer;
