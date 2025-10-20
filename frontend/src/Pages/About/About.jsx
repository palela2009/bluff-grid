import React from 'react';
import './About.css';
import { Trophy, Gamepad2, Heart, Mail, Github, Linkedin } from 'lucide-react';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-hero">
        <div className="hero-icon">
          <Gamepad2 size={60} />
        </div>
        <h1 className="about-title">About Bluff Grid</h1>
        <p className="about-subtitle">A Social Deduction Party Game</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <div className="section-icon">
            <Trophy size={32} />
          </div>
          <h2>The Game</h2>
          <p>
            Bluff Grid is a multiplayer party game where players compete to identify 
            true statements from a grid of 5 statements. Each round, one player's grid 
            is featured, and everyone else votes on which statement they think is TRUE. 
            Score points by guessing correctly and fooling others with your own tricky grids!
          </p>
        </section>

        <section className="about-section creator-section">
          <div className="section-icon">
            <Heart size={32} />
          </div>
          <h2>Created By</h2>
          <div className="creator-card">
            <div className="creator-info">
              <h3 className="creator-name">Alexander Palelashvili</h3>
              <p className="creator-bio">
                Born June 26, 2009 • Full-Stack Developer & Game Designer
              </p>
              <p className="creator-description">
                I created Bluff Grid to bring friends and family together through 
                interactive gameplay. This project combines my passion for game design, 
                web development, and creating meaningful social experiences.
              </p>
            </div>
            
            <div className="tech-stack">
              <h4>Built With</h4>
              <div className="tech-badges">
                <span className="tech-badge">React</span>
                <span className="tech-badge">Node.js</span>
                <span className="tech-badge">Socket.IO</span>
                <span className="tech-badge">MongoDB</span>
                <span className="tech-badge">Firebase</span>
                <span className="tech-badge">Express</span>
              </div>
            </div>
          </div>

          <div className="social-links">
            <a href="mailto:alexandre26062009@gmail.com" className="social-link" target="_blank" rel="noopener noreferrer">
              <Mail size={20} />
              <span>Contact Me</span>
            </a>
          </div>
        </section>

        <section className="about-section">
          <h2>Version History</h2>
          <div className="version-timeline">
            <div className="version-item">
              <div className="version-badge">v1.0</div>
              <div className="version-details">
                <h4>Initial Release</h4>
                <p>Core gameplay, grid creation, voting system, and real-time multiplayer</p>
                <span className="version-date">October 2025</span>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section thanks-section">
          <h2>Special Thanks</h2>
          <p>
            Thank you to everyone who playtested the game and provided valuable 
            feedback. Your input helped shape Bluff Grid into what it is today!
          </p>
        </section>
      </div>

      <div className="about-footer">
        <p className="footer-copyright">2025 <span className="footer-creator-name">Alexander Palelashvili</span>. All rights reserved.</p>
        <p className="made-with">Made with <Heart size={14} className="heart-icon" /> for the joy of gaming</p>
      </div>
    </div>
  );
};

export default About;
