import React from "react"
import "./About.css"

const About = () => {
  return (
    <div className="about-container">
      <div className="about-hero">
        <h1>About Bluff Grid</h1>
        <p className="about-tagline">The Ultimate Bluffing Strategy Game</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <div className="section-icon">🎯</div>
          <h2>What is Bluff Grid?</h2>
          <p>
            Bluff Grid is a strategic multiplayer game where players create 5
            grids with only one being true. Your goal? Convince others to pick
            the wrong grids while you identify the truth in theirs.
          </p>
        </section>

        <section className="about-section">
          <div className="section-icon">🎮</div>
          <h2>How to Play</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Create Your Grids</h3>
              <p>Create 5 grids - mark only 1 as true, the rest are bluffs</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Join a Game</h3>
              <p>Create a room or join friends with a game code</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Bluff & Guess</h3>
              <p>Pick grids from opponents and try to find the true one</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Win Points</h3>
              <p>Earn points by finding truths and deceiving others</p>
            </div>
          </div>
        </section>

        <section className="about-section features-section">
          <div className="section-icon">✨</div>
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">👥</span>
              <h3>Multiplayer</h3>
              <p>Play with up to 8 friends in real-time</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🔒</span>
              <h3>Private Rooms</h3>
              <p>Create secure game rooms with unique codes</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📊</span>
              <h3>Track Progress</h3>
              <p>Save your grids and view your game history</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🎨</span>
              <h3>Customize</h3>
              <p>Create unique grids and strategies</p>
            </div>
          </div>
        </section>

        <section className="about-section creator-section">
          <div className="section-icon">👨‍💻</div>
          <h2>About the Creator</h2>
          <div className="creator-card">
            <div className="creator-avatar">AP</div>
            <h3 className="creator-name">Alexander Palelashvili</h3>
            <p className="creator-title">Full Stack Web Developer</p>
            <div className="creator-info">
              <div className="info-item">
                <span className="info-icon">🎂</span>
                <span>Born June 26, 2009</span>
              </div>
              <div className="info-item">
                <span className="info-icon">💻</span>
                <span>3 Years of Web Development</span>
              </div>
              <div className="info-item">
                <span className="info-icon">📧</span>
                <a href="mailto:alexandre26062009@gmail.com">
                  alexandre26062009@gmail.com
                </a>
              </div>
            </div>
            <div className="creator-bio">
              <p>
                Passionate about creating engaging web experiences and
                multiplayer games. Bluff Grid is a project that combines
                strategy, psychology, and real-time interaction.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default About
