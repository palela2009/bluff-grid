import React from "react"
import "./Leaderboard.css"
import { Trophy, Home } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

const Leaderboard = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const roomData = location.state?.roomData
  const players = Array.isArray(roomData?.players) ? [...roomData.players] : []

  // compute initials helper
  const initialOf = name =>
    name && name.trim().length > 0 ? name.trim()[0].toUpperCase() : "?"

  // sort by totalScore desc; fallback to 0
  players.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))

  const topPlayers = players.slice(0, 3).map((p, idx) => ({
    name: p.name,
    score: p.totalScore || 0,
    rank: idx + 1,
    initial: initialOf(p.name),
    photoUrl: p.photoUrl,
    winner: idx === 0
  }))

  return (
    <div className="container">
      <div className="trophy-icon">
        <Trophy size={70} color="var(--purple-500)" />
      </div>
      <h1 className="title">Game Over!</h1>
      <h2 className="subtitle">Final Results</h2>

      <div className="top-players-wrapper">
        {topPlayers.map((player, index) => (
          <div
            key={index}
            className={`player-card ${player.rank === 1 ? "winner-card" : ""}`}
          >
            <div className="rank-badge">{player.rank}</div>
            <div className="avatar">
              {player.photoUrl ? (
                <img src={player.photoUrl} alt={player.name} />
              ) : (
                <span className="avatar-initial">{player.initial}</span>
              )}
            </div>
            <div className="name">{player.name}</div>
            <div className="score">{player.score} pts</div>
            {player.winner && <div className="winner-label">🏆 Winner!</div>}
          </div>
        ))}
      </div>

      {players.length > 3 && (
        <div className="other-players-section">
          <h1>Other Players</h1>
          {players.slice(3).map((p, i) => (
            <div key={i} className="card other-player-card">
              <div className="rank-badge small">{i + 4}</div>
              <div className="avatar small">
                {p.photoUrl ? (
                  <img src={p.photoUrl} alt={p.name} />
                ) : (
                  <span className="avatar-initial">{initialOf(p.name)}</span>
                )}
              </div>
              <div className="other-player-info">
                <div className="name">{p.name}</div>
                <div className="score">{p.totalScore || 0} pts</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="footer-buttons">
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          <Home /> Back to Home
        </button>
      </div>
    </div>
  )
}

export default Leaderboard
