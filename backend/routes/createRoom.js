
const express = require("express")
const router = express.Router()

const rooms = {} 

const generateRoomCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

router.post("/", (req, res) => {
  const { username } = req.body
  const roomCode = generateRoomCode()

  const hostId = req.body.userId || `host-${Date.now()}`

  rooms[roomCode] = {
    hostId,
    players: [
      {
        id: hostId,
        name: username || "Host",
        role: "Host",
        ready: false
      }
    ],
    createdAt: Date.now()
  }

  res.status(201).json({
    roomCode,
    hostId,
    message: "Room created successfully"
  })
})

module.exports = router
