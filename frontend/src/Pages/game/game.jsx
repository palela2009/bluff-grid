import React, { useState, useEffect, useContext, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import "./game.css"
import { QuestionCard } from "./questionCard"
import { socket } from "../../socket"
import { AuthContext } from "../../lib/AuthContext"
import { Trophy } from "lucide-react"
import soundManager from "../../lib/sounds"

export function Game() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [roomData, setRoomData] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [questionIndex, setQuestionIndex] = useState(0)
  const [players, setPlayers] = useState([])
  const [gamePhase, setGamePhase] = useState("playing")
  const [timeLeft, setTimeLeft] = useState(60)
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answers, setAnswers] = useState([])
  const [isHost, setIsHost] = useState(false)
  const [voteCounts, setVoteCounts] = useState([])
  const hasJoinedRoom = useRef(false) // Track if we've already joined

  // Get room code from URL or fallback to roomData
  const params = new URLSearchParams(location.search)
  const roomCode = params.get("code") || location.state?.roomData?.code

  console.log("Game component loaded. Room code:", roomCode)

  // Join room ONCE when component mounts
  useEffect(() => {
    // Prevent double-joining in React StrictMode
    if (hasJoinedRoom.current) {
      console.log("⚠️ Already joined room, skipping duplicate join")
      return
    }

    // Get room data from navigation state
    if (!location.state?.roomData) {
      console.warn("No room data in navigation state, redirecting to home")
      navigate("/")
      return
    }

    if (!roomCode) {
      console.error("No room code found in URL or state!")
      navigate("/")
      return
    }

    setRoomData(location.state.roomData)
    setPlayers(location.state.roomData.players)
    setCurrentQuestion(location.state.roomData.questions[0])
    const hostStatus = location.state.isHost
    setIsHost(hostStatus)

    // Find the current player's data from room to get their selectedGridId
    const currentPlayerData = location.state.roomData.players.find(
      p => p.firebaseId === user?.uid
    )

    // Re-join the room immediately with player data
    if (!socket.connected) {
      socket.connect()
    }

    socket.emit("join-room", {
      code: roomCode,
      player: {
        name: user?.username || user?.displayName || "Anonymous",
        role: hostStatus ? "Host" : "Player",
        photoUrl: user?.photoUrl,
        firebaseId: user?.uid,
        selectedGridId: currentPlayerData?.selectedGridId // Pass the selectedGridId!
      }
    })

    // Mark that we've joined
    hasJoinedRoom.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run ONLY ONCE on mount

  // Listen for socket events
  useEffect(() => {
    if (!roomCode) return

    // Listen for next question
    socket.on("next-question", roomData => {
      soundManager.play("notification")
      setRoomData(roomData)
      setQuestionIndex(roomData.currentQuestionIndex)
      setCurrentQuestion(roomData.questions[roomData.currentQuestionIndex])
      setShowAnswer(false)
      setSelectedAnswer(null)
      setTimeLeft(60)
    })

    // Listen for game finished
    socket.on("game-finished", roomData => {
      soundManager.play("victory")
      setGamePhase("finished")
      setRoomData(roomData)
      // Navigate to leaderboard with scores
      navigate("/leaderboard", { state: { roomData } })
    })

    // Round lifecycle events
    socket.on("round-complete", roomData => {
      soundManager.play("reveal")
      console.log(
        "Round complete received with vote counts:",
        roomData.voteCounts
      )
      setRoomData(roomData)
      setShowAnswer(true)
      setVoteCounts(roomData.voteCounts || [])
    })

    socket.on("answer-submitted", roomData => {
      console.log(
        "Answer submitted, updating vote counts:",
        roomData.voteCounts
      )
      setRoomData(roomData)
      setVoteCounts(roomData.voteCounts || [])
    })

    socket.on("round-started", roomData => {
      setRoomData(roomData)
      setQuestionIndex(0)
      setCurrentQuestion(roomData.questions[0])
      setShowAnswer(false)
      setSelectedAnswer(null)
      setTimeLeft(60)
      setVoteCounts([])
    })

    // Cleanup
    return () => {
      socket.off("next-question")
      socket.off("game-finished")
      socket.off("round-complete")
      socket.off("round-started")
      socket.off("answer-submitted")
    }
  }, [location.state, navigate])

  useEffect(() => {
    if (gamePhase !== "playing" || showAnswer) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === 1) {
          clearInterval(timer)
          // Auto-submit if no answer selected
          if (selectedAnswer === null) {
            const statements = roomData?.questions?.[0]?.statements || []
            const randomIndex = Math.floor(Math.random() * statements.length)
            const randomOption = statements[randomIndex] || "No answer"
            console.log(
              "⏰ Time's up! Auto-submitting random option:",
              randomOption
            )
            handleAnswer(randomOption, randomIndex) // Submit random answer
          }
          setShowAnswer(true)
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gamePhase, showAnswer, selectedAnswer, roomData])

  const handleAnswer = (option, answerIndex) => {
    if (selectedAnswer !== null) {
      console.log("Already answered, ignoring")
      return // Prevent multiple answers
    }

    console.log("=== ANSWER SUBMITTED ===")
    console.log("Option text:", option)
    console.log("Answer index:", answerIndex)
    console.log("Room code:", roomCode)
    console.log(
      "True statement index:",
      roomData?.questions?.[0]?.trueStatementIndex
    )

    // Play sound based on correctness
    const isCorrect =
      answerIndex === roomData?.questions?.[0]?.trueStatementIndex
    soundManager.play(isCorrect ? "correct" : "incorrect")

    setSelectedAnswer(answerIndex)
    setShowAnswer(true)

    // Emit answer to server with the answer index
    socket.emit("submit-answer", {
      code: roomCode,
      answerIndex: answerIndex
    })
  }

  const handleBackToLobby = () => {
    navigate("/")
  }

  if (gamePhase === "finished") {
    return (
      <div className="container">
        <div className="game-over-screen">
          <div className="game-over-content">
            <div className="game-over-icon"></div>
            <h1>Game Over!</h1>
            <p>Thanks for playing Bluff Grid!</p>
            <button className="btn btn-primary" onClick={handleBackToLobby}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!roomData || !currentQuestion) {
    return (
      <div className="container">
        <div className="loading">Loading game...</div>
      </div>
    )
  }

  // Create answer options using all statements from the grid (consistent order)
  const generateAnswers = () => {
    if (!roomData?.questions || !roomData.questions[0]?.statements) return []
    // Keep original order so every client sees the same layout
    return [...roomData.questions[0].statements]
  }

  const answerOptions = generateAnswers()

  return (
    <div className="container">
      <div className="game-header">
        <div className="game-header-top">
          <div className="round-info">
            <span className="round-badge">
              Round {(roomData?.roundIndex || 0) + 1}/
              {roomData?.players?.length || 1}
            </span>
          </div>
          <div className="timer">{timeLeft}s</div>
        </div>

        <div className="players-section">
          <p className="players-label">Players in game:</p>
          <div className="players-list">
            {players.map(player => (
              <div
                key={player.id}
                className={`player-tag ${
                  player.id === socket.id ? "active" : ""
                }`}
              >
                {player.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="question-display">
        <h3 className="current-question">
          {roomData?.questions?.[0]?.text ||
            "Which statement is TRUE about you?"}
        </h3>
        {roomData?.selectedGridTitle && (
          <div className="grid-info">
            <p className="grid-title">Playing: {roomData.selectedGridTitle}</p>
            {roomData.selectedGridOwner === socket.id && (
              <p className="grid-owner">(This is your grid!)</p>
            )}
          </div>
        )}
      </div>

      <QuestionCard
        question="Which statement is TRUE about you?"
        answers={answerOptions}
        correct={
          roomData?.questions?.[0]?.statements?.[
            roomData?.questions?.[0]?.trueStatementIndex
          ]
        }
        onAnswer={handleAnswer}
        showAnswer={showAnswer}
        selectedOption={selectedAnswer}
        voteCounts={voteCounts}
      />

      {isHost && !showAnswer && (
        <div style={{ marginTop: 16 }}>
          <button
            className="btn btn-warning"
            onClick={() => {
              console.log("⏩ Host forcing show results")
              socket.emit("force-show-results", { code: roomCode })
            }}
          >
            Skip & Show Results
          </button>
          <p style={{ fontSize: "0.9em", color: "#666", marginTop: 8 }}>
            Click if you want to skip waiting for other players
          </p>
        </div>
      )}

      {isHost && showAnswer && (
        <div style={{ marginTop: 16 }}>
          <button
            className="btn btn-primary"
            onClick={() => {
              console.log("Next Player Grid clicked. Room code:", roomCode)
              console.log("Current room data:", roomData)
              // Compute next player's firebaseId from roundOrder
              const currentIdx = roomData?.roundIndex || 0
              const nextIdx = currentIdx + 1
              const nextSocketId = roomData?.roundOrder?.[nextIdx]
              const nextPlayer = roomData?.players?.find(
                p => p.id === nextSocketId
              )
              const nextOwnerFirebaseId = nextPlayer?.firebaseId
              console.log(
                "Next player:",
                nextPlayer?.name,
                "FirebaseId:",
                nextOwnerFirebaseId
              )
              socket.emit("next-player-grid", {
                code: roomCode,
                selectedGridOwner: nextOwnerFirebaseId
              })
            }}
          >
            Next Player's Grid
          </button>
        </div>
      )}
    </div>
  )
}

