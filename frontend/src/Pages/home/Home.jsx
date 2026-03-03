import "./Home.css"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { Play, Users, ClipboardList, Zap, ArrowRight, Sparkles, Target, Trophy } from "lucide-react"
import soundManager from "../../lib/sounds"

const generateRoomCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export const Home = () => {
  const navigate = useNavigate()
  const [roomCode, setRoomCode] = useState("")

  const handleHostGame = () => {
    soundManager.play("click")
    const code = generateRoomCode()
    navigate(`/lobby?code=${code}&host=true`)
  }

  const handleJoinGame = () => {
    if (roomCode.trim() !== "") {
      soundManager.play("join")
      navigate(`/lobby?code=${roomCode.toUpperCase()}`)
    } else {
      soundManager.play("incorrect")
      alert("Please enter a room code.")
    }
  }

  return (
    <div className="home-page">
      {/* Ambient background */}
      <div className="home-glow home-glow-1" />
      <div className="home-glow home-glow-2" />
      <div className="home-glow home-glow-3" />

      {/* Hero */}
      <section className="home-hero">
        <div className="hero-badge">
          <Sparkles size={16} />
          <span>The Ultimate Bluffing Game</span>
        </div>

        <h1 className="hero-heading">
          <img src="/logo.png" alt="BG" className="hero-logo" />
          <div>
            <span className="hero-line-1">Can Your Friends</span>
            <span className="hero-line-2">Spot The Truth?</span>
          </div>
        </h1>

        <p className="hero-desc">
          Create grids of facts and lies, then challenge your friends to find what's real.
          The best bluffer wins.
        </p>

        <div className="hero-actions">
          <button className="btn-host" onClick={handleHostGame}>
            <Play size={20} />
            Host a Game
          </button>

          <div className="join-box">
            <input
              type="text"
              placeholder="ROOM CODE"
              className="join-input"
              value={roomCode}
              onChange={e => setRoomCode(e.target.value)}
              maxLength={8}
            />
            <button className="btn-join" onClick={handleJoinGame}>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="stats-strip">
          <div className="stat-item">
            <Users size={18} />
            <span>2-8 Players</span>
          </div>
          <div className="stat-dot" />
          <div className="stat-item">
            <Zap size={18} />
            <span>Real-time</span>
          </div>
          <div className="stat-dot" />
          <div className="stat-item">
            <Target size={18} />
            <span>5 Rounds</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="home-steps">
        <h2 className="steps-heading">How It Works</h2>

        <div className="steps-row">
          <div className="step-card">
            <div className="step-icon step-purple">
              <ClipboardList size={28} />
            </div>
            <div className="step-num">01</div>
            <h3>Create Your Grids</h3>
            <p>Write 5 statements — 4 lies and 1 truth. Make them believable to fool your friends.</p>
          </div>

          <div className="step-arrow">
            <ArrowRight size={24} />
          </div>

          <div className="step-card">
            <div className="step-icon step-pink">
              <Users size={28} />
            </div>
            <div className="step-num">02</div>
            <h3>Invite Friends</h3>
            <p>Share your room code and watch friends join. More players = more chaos!</p>
          </div>

          <div className="step-arrow">
            <ArrowRight size={24} />
          </div>

          <div className="step-card">
            <div className="step-icon step-green">
              <Trophy size={28} />
            </div>
            <div className="step-num">03</div>
            <h3>Play & Win</h3>
            <p>Guess the truth in each grid. Fool others with your lies to score even more!</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
