import React from "react"
import "./About.css"
import { Target, Gamepad2, Users, Lock, BarChart3, Palette, ClipboardList, UserPlus, Swords, Trophy, Code, Mail, Calendar } from "lucide-react"

const About = () => {
  return (
    <div className="about-page">
      {/* Ambient */}
      <div className="about-glow about-glow-1" />
      <div className="about-glow about-glow-2" />

      {/* Hero */}
      <header className="about-hero">
        <div className="about-hero-icon">
          <Target size={36} />
        </div>
        <h1 className="about-title">About Bluff Grid</h1>
        <p className="about-subtitle">
          The strategic multiplayer bluffing game where truth hides among lies.
          Create grids, deceive friends, and prove you're the ultimate bluffer.
        </p>
      </header>

      <div className="about-body">
        {/* How to Play */}
        <section className="about-block">
          <div className="block-header">
            <Gamepad2 size={22} />
            <h2>How to Play</h2>
          </div>

          <div className="play-steps">
            <div className="play-step">
              <div className="play-step-icon play-purple">
                <ClipboardList size={24} />
              </div>
              <div className="play-step-body">
                <div className="play-step-num">Step 1</div>
                <h3>Create Your Grids</h3>
                <p>Write 5 statements per grid — mark only 1 as true, the rest are bluffs. Be creative!</p>
              </div>
            </div>

            <div className="play-step">
              <div className="play-step-icon play-pink">
                <UserPlus size={24} />
              </div>
              <div className="play-step-body">
                <div className="play-step-num">Step 2</div>
                <h3>Join a Room</h3>
                <p>Host a game or join friends with a unique room code. Up to 8 players per room.</p>
              </div>
            </div>

            <div className="play-step">
              <div className="play-step-icon play-amber">
                <Swords size={24} />
              </div>
              <div className="play-step-body">
                <div className="play-step-num">Step 3</div>
                <h3>Bluff & Guess</h3>
                <p>Pick grids from opponents and try to find the one true statement among the lies.</p>
              </div>
            </div>

            <div className="play-step">
              <div className="play-step-icon play-green">
                <Trophy size={24} />
              </div>
              <div className="play-step-body">
                <div className="play-step-num">Step 4</div>
                <h3>Win Points</h3>
                <p>Earn points by finding truths and by successfully deceiving other players.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="about-block">
          <div className="block-header">
            <Palette size={22} />
            <h2>Features</h2>
          </div>

          <div className="features-grid">
            <div className="feat-card">
              <Users size={24} className="feat-icon" />
              <h3>Multiplayer</h3>
              <p>Play with up to 8 friends in real-time</p>
            </div>
            <div className="feat-card">
              <Lock size={24} className="feat-icon" />
              <h3>Private Rooms</h3>
              <p>Secure game rooms with unique codes</p>
            </div>
            <div className="feat-card">
              <BarChart3 size={24} className="feat-icon" />
              <h3>Leaderboard</h3>
              <p>Track your stats and climb the ranks</p>
            </div>
            <div className="feat-card">
              <Gamepad2 size={24} className="feat-icon" />
              <h3>Real-time</h3>
              <p>Instant live gameplay with Socket.IO</p>
            </div>
          </div>
        </section>

        {/* Creator */}
        <section className="about-block creator-block">
          <div className="block-header">
            <Code size={22} />
            <h2>The Creator</h2>
          </div>

          <div className="creator-card">
            <div className="creator-avatar">AP</div>
            <div className="creator-details">
              <h3 className="creator-name">Alexander Palelashvili</h3>
              <p className="creator-role">Full Stack Developer</p>

              <div className="creator-tags">
                <span className="creator-tag">
                  <Calendar size={14} />
                  Born June 26, 2009
                </span>
                <span className="creator-tag">
                  <Code size={14} />
                  3+ Years Experience
                </span>
                <span className="creator-tag">
                  <Mail size={14} />
                  <a href="mailto:alexandre26062009@gmail.com">alexandre26062009@gmail.com</a>
                </span>
              </div>

              <p className="creator-bio">
                Passionate about creating engaging web experiences and multiplayer games.
                Bluff Grid combines strategy, psychology, and real-time interaction into one app.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default About
