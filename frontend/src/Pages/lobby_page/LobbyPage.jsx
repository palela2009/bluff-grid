import React, { useEffect, useState, useContext, useRef } from "react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import "./LobbyPage.css"
import { User, CheckCircle, ArrowLeft, Play, AlertCircle } from "lucide-react"
import { socket } from "../../socket"
import { AuthContext } from "../../lib/AuthContext"
import axiosInstance from "../../lib/axiosInstance"

const Lobby = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const params = new URLSearchParams(location.search)
  const code = params.get("code") || "UNKNOWN"
  const isHost = params.get("host") === "true"
  const [players, setPlayers] = useState([])
  const [selectedGrid, setSelectedGrid] = useState(null)
  const [userGrids, setUserGrids] = useState([])
  const [roomData, setRoomData] = useState(null)
  const [error, setError] = useState("")
  const hasEmittedGridSelection = useRef(false)
  const [loadingGrids, setLoadingGrids] = useState(true)

  // Fetch user's bluff grids
  useEffect(() => {
    const fetchUserGrids = async () => {
      if (!user?.uid) return

      try {
        setLoadingGrids(true)
        const response = await axiosInstance.get("/grids")
        setUserGrids(response.data)

        // Set the first grid as default if available
        if (response.data.length > 0) {
          const firstGrid = response.data[0]
          setSelectedGrid(firstGrid)
          // Note: We'll emit select-grid after joining the room
        }
      } catch (err) {
        console.error("Failed to fetch grids:", err)
        setError("Failed to load your bluff grids")
      } finally {
        setLoadingGrids(false)
      }
    }

    fetchUserGrids()
  }, [user?.uid])

  useEffect(() => {
    if (!socket.connected) {
      socket.connect()
    }

    const joinRoom = () => {
      console.log("Current user object:", user)
      console.log("User username:", user?.username)
      console.log("User displayName:", user?.displayName)

      const playerData = {
        name: user?.username || "Anonymous",
        role: isHost ? "Host" : "Player",
        photoUrl: user?.photoUrl,
        firebaseId: user?.uid
      }

      console.log("Joining room", code, "as", playerData.name)
      socket.emit("join-room", {
        code,
        player: playerData
      })
    }

    // Join room initially and on reconnection
    joinRoom()
    socket.on("connect", joinRoom)

    // Listen for room updates
    socket.on("room-update", roomData => {
      console.log("Room update received:", roomData.players.length, "players")
      setPlayers(roomData.players)
      setRoomData(roomData)
    })

    // Listen for game started
    socket.on("game-started", roomData => {
      console.log("Game started!", roomData)
      // Navigate to game page with room data
      navigate(`/game?code=${code}`, {
        state: { roomData, isHost }
      })
    })

    // Listen for errors
    socket.on("error", errorData => {
      setError(errorData.message)
      setTimeout(() => setError(""), 5000) // Clear error after 5 seconds
    })

    // Cleanup on unmount
    return () => {
      console.log("Cleaning up socket listeners")
      socket.off("connect", joinRoom)
      socket.off("room-update")
      socket.off("game-started")
      socket.off("error")
      socket.disconnect()
    }
  }, [code, isHost, user, navigate])

  // Separate useEffect for handling grid selection after joining
  useEffect(() => {
    if (!roomData || !selectedGrid || hasEmittedGridSelection.current) {
      return;
    }
    
    const currentPlayer = roomData.players.find(p => p.firebaseId === user?.uid);
    if (currentPlayer && !currentPlayer.selectedGridId) {
      console.log("🎯 Auto-selecting first grid:", selectedGrid.title);
      socket.emit("select-grid", { code, gridId: selectedGrid._id });
      hasEmittedGridSelection.current = true;
    }
  }, [roomData, selectedGrid, user?.uid, code])

  const handleCopyLink = () => {
    const url = `${window.location.origin}/lobby?code=${code}`

    navigator.clipboard.writeText(url)

    alert("Game link copied to clipboard!")
  }

  const handleToggleReady = () => {
    socket.emit("toggle-ready", { code })
  }

  const handleStartGame = () => {
    if (!isHost || !selectedGrid) return

    console.log("🚀 Starting game with selected grid:", {
      title: selectedGrid.title,
      gridId: selectedGrid._id,
      owner: user.uid,
      statements: selectedGrid.statements
    });

    socket.emit("start-game", {
      code,
      selectedGridId: selectedGrid._id,
      selectedGridOwner: user.uid
    })
  }

  const handleRandomizeGrid = () => {
    if (userGrids.length === 0) return

    const randomIndex = Math.floor(Math.random() * userGrids.length)
    const randomGrid = userGrids[randomIndex]
    setSelectedGrid(randomGrid)
    // Emit grid selection to server
    socket.emit("select-grid", { code, gridId: randomGrid._id })
    hasEmittedGridSelection.current = true
  }

  // Check if all players are ready
  const allPlayersReady =
    players.length > 0 && players.every(player => player.ready)

  // Ensure socket is connected before trying to access socket.id
  const isCurrentPlayer = playerId => {
    return socket.connected && playerId === socket.id
  }

  return (
    <div className="card">
      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="lobby-details">
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={15} className="me-2" />
          Back to Home
        </Link>

        <h2>Game Lobby</h2>

        <p>Waiting for players to join and get ready</p>

        <div className="game-code-container">
          <h3 className="game-code1">Game Code</h3>

          <div className="game-code">{code}</div>

          <button
            className="copy-link-button btn btn-secondary"
            onClick={handleCopyLink}
          >
            Copy Game Link
          </button>
        </div>

        <div className="players-section">
          <div className="players-header">
            <User size={24} /> Players ({players.length}/8)
          </div>

          {players.map(player => (
            <div className="player-item" key={player.id}>
              <div className="player-avatar">{player.name[0]}</div>

              <div className="player-info">
                <span className="player-name">{player.name}</span>

                {player.role && (
                  <span className="player-role">{player.role}</span>
                )}
                
                {player.selectedGridId && (
                  <span className="player-grid-status" style={{ fontSize: '0.8em', color: '#28a745' }}>
                    ✓ Grid selected
                  </span>
                )}
                {!player.selectedGridId && (
                  <span className="player-grid-status" style={{ fontSize: '0.8em', color: '#dc3545' }}>
                    ⚠ No grid selected
                  </span>
                )}
              </div>

              <div className="player-actions">
                {isCurrentPlayer(player.id) ? (
                  // Current player - show ready toggle button
                  <button
                    className={`btn ${
                      player.ready ? "btn-success" : "btn-warning"
                    }`}
                    onClick={handleToggleReady}
                  >
                    {player.ready ? (
                      <>
                        <CheckCircle size={16} className="me-2" />
                        Ready
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} className="me-2" />
                        Not Ready
                      </>
                    )}
                  </button>
                ) : (
                  // Other players - show status
                  <div className="player-status">
                    {player.ready ? (
                      <>
                        <CheckCircle size={20} className="text-success" />
                        Ready
                      </>
                    ) : (
                      <>
                        <AlertCircle size={20} className="text-warning" />
                        Not Ready
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="game-options">
        <h3>Select Your Grid</h3>

        <p>Choose a bluff grid to use in the game</p>

        {loadingGrids ? (
          <div className="loading-grids">Loading your grids...</div>
        ) : userGrids.length === 0 ? (
          <div className="no-grids">
            <p>You haven't created any bluff grids yet.</p>
            <Link to="/create" className="btn btn-primary">
              Create Your First Grid
            </Link>
          </div>
        ) : (
          <>
            <div className="select-grid-container">
              <label htmlFor="grid-select">Choose a grid:</label>

              <select
                id="grid-select"
                value={selectedGrid?._id || ""}
                onChange={e => {
                  const grid = userGrids.find(g => g._id === e.target.value)
                  setSelectedGrid(grid)
                  // Emit grid selection to server
                  socket.emit("select-grid", { code, gridId: grid._id })
                  hasEmittedGridSelection.current = true
                }}
              >
                {userGrids.map(grid => (
                  <option key={grid._id} value={grid._id}>
                    {grid.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedGrid && (
              <div className="selected-grid-info">
                <h4 className="selected-grid-title">{selectedGrid.title}</h4>
                <div className="grid-full-preview">
                  <div className="preview-header">
                    <span className="preview-label">Your Grid Preview</span>
                    <span className="statements-count">{selectedGrid.statements.length} statements</span>
                  </div>
                  <div className="statements-list">
                    {selectedGrid.statements.map((statement, index) => (
                      <div 
                        key={index} 
                        className={`statement-item ${index === selectedGrid.trueStatementIndex ? 'true-statement' : ''}`}
                      >
                        <span className="statement-number">#{index + 1}</span>
                        <span className="statement-text">{statement}</span>
                        {index === selectedGrid.trueStatementIndex && (
                          <span className="true-badge">TRUE</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              className="randomize-button btn btn-secondary"
              onClick={handleRandomizeGrid}
              disabled={userGrids.length === 0}
            >
              Randomize
            </button>

            {isHost && (
              <button
                className={`start-game-button btn ${
                  allPlayersReady && selectedGrid
                    ? "btn-primary"
                    : "btn-secondary"
                }`}
                onClick={handleStartGame}
                disabled={!allPlayersReady || !selectedGrid}
              >
                <Play size={16} className="me-2" />
                {!selectedGrid
                  ? "Select a grid first"
                  : allPlayersReady
                  ? "Start Game"
                  : "Waiting for players to be ready"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Lobby
