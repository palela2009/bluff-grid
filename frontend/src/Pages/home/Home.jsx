import "./Home.css"

import { useNavigate } from "react-router-dom"

import { useState } from "react"
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
    <div className="container">
      <div className="top-section">
        <div className="tagline">🎯 The Ultimate Friend Quiz Game</div>

        <h1 className="title">Can Your Friends Spot The Truth?</h1>

        <p className="subtitle">
          Create topic-based grids of facts and lies, then watch them guess
          what's real.
        </p>

        <div className="game-actions">
          <button className="host-button" onClick={handleHostGame}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="icon"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M4 10a4 4 0 118 0 4 4 0 01-8 0zm12 0a3 3 0 116 0 3 3 0 01-6 0zM2 18a6 6 0 0112 0v1H2v-1zm14.5 0c0-.534-.07-1.05-.202-1.54a4.5 4.5 0 016.202 4.54h-6v-1z" />
            </svg>
            Host a Game
          </button>

          <input
            type="text"
            placeholder="Enter room code"
            className="room-input"
            value={roomCode}
            onChange={e => setRoomCode(e.target.value)}
          />

          <button className="join-button" onClick={handleJoinGame}>
            Join
          </button>
        </div>

        <p className="step-intro">
          Three simple steps to discover how well your friends really know you
        </p>
      </div>

      <div className="steps">
        <div className="step-box">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-6"
          >
            <path
              fillRule="evenodd"
              d="M7.502 6h7.128A3.375 3.375 0 0 1 18 9.375v9.375a3 3 0 0 0 3-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 0 0-.673-.05A3 3 0 0 0 15 1.5h-1.5a3 3 0 0 0-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6ZM13.5 3A1.5 1.5 0 0 0 12 4.5h4.5A1.5 1.5 0 0 0 15 3h-1.5Z"
              clipRule="evenodd"
            />

            <path
              fillRule="evenodd"
              d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V9.375ZM6 12a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V12Zm2.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75ZM6 15a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V15Zm2.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75ZM6 18a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V18Zm2.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75Z"
              clipRule="evenodd"
            />
          </svg>

          <div className="step-title">Create Topic-Based Grids</div>

          <p className="step-text">
            Craft 5 statements about yourself on different topics – 4 clever
            lies and 1 surprising truth. Make them believable to keep your
            friends guessing!
          </p>
        </div>

        <div className="step-box blue">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-6"
          >
            <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
          </svg>

          <div className="step-title blue">Invite Friends</div>

          <p className="step-text">
            Share your game code and watch as friends join your lobby. The more
            players, the more fun and surprising the results!
          </p>
        </div>

        <div className="step-box">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-6"
          >
            <path
              fillRule="evenodd"
              d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75v-4.131A15.838 15.838 0 0 1 6.382 15H2.25a.75.75 0 0 1-.75-.75 6.75 6.75 0 0 1 7.815-6.666ZM15 6.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z"
              clipRule="evenodd"
            />

            <path d="M5.26 17.242a.75.75 0 1 0-.897-1.203 5.243 5.243 0 0 0-2.05 5.022.75.75 0 0 0 .625.627 5.243 5.243 0 0 0 5.022-2.051.75.75 0 1 0-1.202-.897 3.744 3.744 0 0 1-3.008 1.51c0-1.23.592-2.323 1.51-3.008Z" />
          </svg>

          <div className="step-title">Play & Score</div>

          <p className="step-text">
            Guess the truth in each friend's grid and earn points. Fool others
            with your lies to score even more!
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home
