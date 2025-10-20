import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import User from  "./Models/User.js";
import { Server } from "socket.io"
import { createServer } from "http"

dotenv.config();



const app = express();
const PORT = process.env.PORT || 3000;
const httpServer = createServer(app);

// Initialize Socket.IO with CORS
// Allow both development and production origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://bluffgrid.com",
  "https://www.bluffgrid.com",
  "https://bluff-grid.netlify.app", // Add your actual Netlify URL here
  /\.netlify\.app$/ // Allow all Netlify preview deploys
];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Store rooms data
const rooms = {};
// Track socket to room mapping
const socketRooms = new Map();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join-room", ({ code, player }) => {
    // Leave previous room if any
    const previousRoom = socketRooms.get(socket.id);
    if (previousRoom) {
      socket.leave(previousRoom);
      if (rooms[previousRoom]) {
        rooms[previousRoom].players = rooms[previousRoom].players.filter(p => p.id !== socket.id);
        if (rooms[previousRoom].players.length === 0) {
          delete rooms[previousRoom];
        } else {
          io.to(previousRoom).emit("room-update", rooms[previousRoom]);
        }
      }
      socketRooms.delete(socket.id);
    }

    // Join new room
    socket.join(code);
    socketRooms.set(socket.id, code);
    
    // Initialize room if it doesn't exist
    if (!rooms[code]) {
      console.log(`📦 Creating NEW room: ${code}`);
      rooms[code] = {
        code,
        players: [],
        phase: "lobby", // lobby, playing, finished
        selectedGridId: null,
        selectedGridOwner: null,
        selectedGridTitle: null,
        currentQuestionIndex: 0,
        questions: [],
        gameStartTime: null,
        roundIndex: 0,
        roundOrder: []
      };
    } else {
      console.log(`♻️ Room ${code} already exists with phase: ${rooms[code].phase}`);
    }

    // Find existing player by firebaseId (not socket.id, as it changes on reconnect)
    const existingPlayerByFirebaseId = rooms[code].players.find(p => p.firebaseId === player.firebaseId);
    
    // Remove any existing entries for this player (by socket.id) 
    rooms[code].players = rooms[code].players.filter(p => p.id !== socket.id && p.firebaseId !== player.firebaseId);

    // Add player to room, preserving answers, scores, and grid selection if player is rejoining
    const playerData = {
      id: socket.id, // New socket ID
      ...player,
      ready: rooms[code].phase === "playing" ? true : false, // Auto-ready if game is playing
      joinedAt: existingPlayerByFirebaseId?.joinedAt || Date.now(),
      // Preserve game data if player is rejoining during an active game
      answers: existingPlayerByFirebaseId?.answers || [],
      scores: existingPlayerByFirebaseId?.scores || [],
      totalScore: existingPlayerByFirebaseId?.totalScore || 0,
      selectedGridId: existingPlayerByFirebaseId?.selectedGridId || player.selectedGridId // Preserve grid selection!
    };
    
    if (existingPlayerByFirebaseId?.selectedGridId) {
      console.log(`✅ Preserved selectedGridId for ${player.name}: ${existingPlayerByFirebaseId.selectedGridId}`);
    } else if (player.selectedGridId) {
      console.log(`📌 New selectedGridId for ${player.name}: ${player.selectedGridId}`);
    } else {
      console.log(`⚠️ No selectedGridId for ${player.name}`);
    }
    
    rooms[code].players.push(playerData);
    
    // Update roundOrder whenever a player rejoins during an active game
    if (rooms[code].phase === "playing") {
      console.log(`🎮 Room is in PLAYING phase, roundOrder already set with firebaseIds`);
      // No need to rebuild - roundOrder uses firebaseIds which don't change
    } else {
      console.log(`📋 Room is in ${rooms[code].phase} phase, NOT rebuilding roundOrder`);
    }

    // Log room state
    console.log(`Room ${code} has ${rooms[code].players.length} players:`, 
      rooms[code].players.map(p => ({ 
        id: p.id, 
        name: p.name, 
        firebaseId: p.firebaseId?.substring(0, 8), 
        gridId: p.selectedGridId?.substring(0, 8) || 'none',
        answers: p.answers?.length, 
        scores: p.scores?.length 
      })));

    // Emit room update to all clients in the room
    io.to(code).emit("room-update", rooms[code]);
  });

  socket.on("toggle-ready", ({ code }) => {
    const room = rooms[code];
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.ready = !player.ready;
      console.log(`Player ${player.name} is now ${player.ready ? 'ready' : 'not ready'}`);
      io.to(code).emit("room-update", room);
    }
  });

  socket.on("select-grid", ({ code, gridId }) => {
    const room = rooms[code];
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.selectedGridId = gridId;
      console.log(`Player ${player.name} selected grid: ${gridId}`);
      io.to(code).emit("room-update", room);
    }
  });

  socket.on("start-game", async ({ code, selectedGridId, selectedGridOwner }) => {
    console.log("📥 start-game event received:", { code, selectedGridId, selectedGridOwner });
    
    const room = rooms[code];
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player || player.role !== "Host") {
      socket.emit("error", { message: "Only the host can start the game" });
      return;
    }

    // Check if all players are ready AND have selected a grid
    const allReady = room.players.every(p => p.ready);
    if (!allReady) {
      socket.emit("error", { message: "All players must be ready to start the game" });
      return;
    }

    const allHaveGrids = room.players.every(p => p.selectedGridId);
    if (!allHaveGrids) {
      socket.emit("error", { message: "All players must select a grid before starting" });
      return;
    }

    try {
      // Start the game (initialize rounds)
      room.phase = "playing";
      // Store firebaseIds in roundOrder (they persist across reconnects, unlike socket IDs)
      const sortedPlayers = [...room.players].sort((a, b) => a.joinedAt - b.joinedAt);
      room.roundOrder = sortedPlayers.map(p => p.firebaseId);
      room.roundIndex = 0;
      room.gameStartTime = Date.now();
      
      console.log(`🎮 Initializing game with ${room.players.length} players`);
      console.log(`Round order set to:`, room.roundOrder.map((firebaseId, i) => {
        const p = room.players.find(player => player.firebaseId === firebaseId);
        return `${i}: ${p?.name} (${firebaseId?.substring(0, 8)})`;
      }));
      
      // Get the first player's grid for round 1
      const firstPlayerFirebaseId = room.roundOrder[0];
      const firstPlayer = room.players.find(p => p.firebaseId === firstPlayerFirebaseId);
      
      console.log("� Fetching grid for first player:", firstPlayer.name, "GridId:", firstPlayer.selectedGridId);
      const user = await User.findOne({ firebaseId: firstPlayer.firebaseId });
      if (!user) {
        socket.emit("error", { message: "Player's grid not found" });
        return;
      }

      const selectedGrid = user.grids.find(g => g._id.toString() === firstPlayer.selectedGridId);
      if (!selectedGrid) {
        console.log("❌ Grid not found! Available grids:", user.grids.map(g => g._id.toString()));
        socket.emit("error", { message: "Selected grid not found" });
        return;
      }

      console.log("✅ Found grid:", { title: selectedGrid.title, statements: selectedGrid.statements.length });

      // Set up the first round with the first player's grid
      room.selectedGridId = firstPlayer.selectedGridId;
      room.selectedGridOwner = firstPlayer.firebaseId;
      room.selectedGridTitle = selectedGrid.title;
      
      console.log(`🎮 Initializing game with ${room.players.length} players`);
      console.log(`Round order set to:`, room.roundOrder.map((id, i) => {
        const p = room.players.find(player => player.id === id);
        return `${i}: ${p?.name} (${id})`;
      }));
      
      // Set up the single question with all statements and the true statement index
      room.questions = [{
        text: `Which statement is TRUE about ${firstPlayer.name}?`,
        statements: selectedGrid.statements,
        trueStatementIndex: selectedGrid.trueStatementIndex || 0
      }];
      
      room.currentPlayerName = firstPlayer.name; // Store whose grid this is
      
      room.currentQuestionIndex = 0;
      room.gameStartTime = Date.now();

      console.log(`✅ Game started in room ${code} with grid: ${selectedGrid.title}`);
      console.log(`Room still exists in rooms object:`, !!rooms[code]);
      console.log(`Available room codes after game start:`, Object.keys(rooms));
      io.to(code).emit("game-started", room);
    } catch (error) {
      console.error("Error starting game:", error);
      socket.emit("error", { message: "Failed to start game" });
    }
  });

  socket.on("submit-answer", ({ code, answerIndex }) => {
    console.log(`📝 Submit answer received from ${socket.id}: code=${code}, answerIndex=${answerIndex}`);
    
    const room = rooms[code];
    if (!room) {
      console.log(`❌ Room not found: ${code}`);
      return;
    }
    
    if (room.phase !== "playing") {
      console.log(`❌ Room phase is ${room.phase}, not playing`);
      return;
    }

    const player = room.players.find(p => p.id === socket.id);
    if (!player) {
      console.log(`❌ Player not found in room. Socket ID: ${socket.id}`);
      console.log(`Available players:`, room.players.map(p => ({ id: p.id, name: p.name })));
      return;
    }

    // Use roundIndex instead of currentQuestionIndex for tracking answers per round
    const roundIdx = room.roundIndex || 0;
    
    // Prevent duplicate submissions
    if (!player.answers) player.answers = [];
    if (player.answers[roundIdx] !== undefined) {
      console.log(`Player ${player.name} already submitted an answer for round ${roundIdx + 1}`);
      return;
    }
    
    player.answers[roundIdx] = answerIndex;

    // Calculate score for this question
    if (!player.scores) player.scores = [];
    
    // Get the current question's true statement index
    const currentQuestion = room.questions[room.currentQuestionIndex];
    const trueStatementIndex = currentQuestion.trueStatementIndex || 0;
    
    // Award 1 point if correct, 0 if incorrect
    const score = (answerIndex === trueStatementIndex) ? 1 : 0;
    player.scores[roundIdx] = score;
    
    console.log(`Player ${player.name} answered ${answerIndex === trueStatementIndex ? 'correctly' : 'incorrectly'} in round ${roundIdx + 1} (selected ${answerIndex}, correct is ${trueStatementIndex}): ${score} point(s)`);

    // Calculate vote counts for this round
    const voteCounts = Array(currentQuestion.statements.length).fill(0);
    room.players.forEach(p => {
      const answer = p.answers?.[roundIdx];
      if (answer !== undefined && answer >= 0 && answer < voteCounts.length) {
        voteCounts[answer]++;
      }
    });
    
    console.log(`Vote counts after ${player.name}'s answer:`, voteCounts);

    // Check if all players have answered
    const allAnswered = room.players.every(p => p.answers && p.answers[roundIdx] !== undefined);
    
    if (allAnswered) {
      // Single-question round complete
      console.log("All players answered. Final vote counts:", voteCounts);
      const roomWithVotes = { ...room, voteCounts };
      io.to(code).emit("round-complete", roomWithVotes);
    } else {
      // Send partial vote counts to all players
      console.log(`${room.players.filter(p => p.answers?.[roundIdx] !== undefined).length}/${room.players.length} players answered`);
      const roomWithVotes = { ...room, voteCounts };
      io.to(code).emit("answer-submitted", roomWithVotes);
    }
  });

  // Admin can force skip to show results (even if not all players answered)
  socket.on("force-show-results", ({ code }) => {
    const room = rooms[code];
    if (!room || room.phase !== "playing") return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player || player.role !== "Host") {
      socket.emit("error", { message: "Only the host can force show results" });
      return;
    }

    const roundIdx = room.roundIndex || 0;
    const currentQuestion = room.questions?.[room.currentQuestionIndex];
    
    // Calculate vote counts
    const voteCounts = Array(currentQuestion.statements.length).fill(0);
    room.players.forEach(p => {
      const answer = p.answers?.[roundIdx];
      if (answer !== undefined && answer >= 0 && answer < voteCounts.length) {
        voteCounts[answer]++;
      }
    });

    console.log("🎯 Host forced show results. Vote counts:", voteCounts);
    const roomWithVotes = { ...room, voteCounts };
    io.to(code).emit("round-complete", roomWithVotes);
  });

  // Host advances to next player's grid (next round)
  socket.on("next-player-grid", async ({ code, selectedGridId, selectedGridOwner }) => {
    console.log("=== NEXT PLAYER GRID REQUEST ===");
    console.log("Room code received:", code);
    console.log("Available rooms:", Object.keys(rooms));
    console.log("Socket ID:", socket.id);
    
    const room = rooms[code];
    if (!room) {
      console.log("❌ Room not found! Code:", code);
      console.log("Available room codes:", Object.keys(rooms));
      socket.emit("error", { message: `Room not found: ${code}` });
      return;
    }
    
    const player = room.players.find(p => p.id === socket.id);
    if (!player || player.role !== "Host") {
      console.log("❌ Not authorized. Player:", player?.name, "Role:", player?.role);
      socket.emit("error", { message: "Only the host can advance rounds" });
      return;
    }

    try {
      let nextIndex = room.roundIndex + 1;
      console.log(`========================================`);
      console.log(`Advancing from round ${room.roundIndex} to ${nextIndex}`);
      console.log(`Total players: ${room.players.length}`);
      console.log(`Total rounds: ${room.roundOrder.length}`);
      console.log(`Round order:`, room.roundOrder);
      console.log(`========================================`);
      
      if (nextIndex >= room.roundOrder.length) {
        // All rounds complete -> finalize and finish
        console.log("✅ All rounds complete, finishing game");
        room.phase = "finished";
        room.players.forEach(p => {
          p.totalScore = p.scores ? p.scores.reduce((sum, score) => sum + score, 0) : 0;
          console.log(`Player ${p.name}: ${p.totalScore} points (scores: ${JSON.stringify(p.scores)})`);
        });
        console.log("Emitting game-finished event");
        io.to(code).emit("game-finished", room);
        return;
      }

      // roundOrder now contains firebaseIds, not socket IDs
      const nextOwnerFirebaseId = room.roundOrder[nextIndex];
      const nextOwner = room.players.find(p => p.firebaseId === nextOwnerFirebaseId);
      if (!nextOwner) {
        console.log("Next player not found. Firebase ID:", nextOwnerFirebaseId);
        socket.emit("error", { message: "Next player not found" });
        return;
      }

      console.log("Next player:", nextOwner.name, "Firebase ID:", nextOwner.firebaseId);

      // Use the next player's selected grid
      selectedGridId = nextOwner.selectedGridId;
      selectedGridOwner = nextOwner.firebaseId;

      if (!selectedGridId) {
        console.log("❌ Next player hasn't selected a grid!");
        socket.emit("error", { message: `${nextOwner.name} hasn't selected a grid` });
        return;
      }

      console.log("Using grid selected by", nextOwner.name, ":", { selectedGridId, selectedGridOwner });
      console.log("Looking for grids for user:", selectedGridOwner);
      const ownerUserDoc = await User.findOne({ firebaseId: selectedGridOwner });
      if (!ownerUserDoc) {
        console.log("User not found in database:", selectedGridOwner);
        socket.emit("error", { message: "Grid owner not found in database" });
        return;
      }

      console.log("User found with", ownerUserDoc.grids?.length || 0, "grids");

      // Use the selectedGridId from the room (set during game start)
      let gridId = selectedGridId;
      if (!gridId) {
        console.log("❌ No grid ID found in room state!");
        socket.emit("error", { message: "Grid configuration error" });
        return;
      }

      console.log("Using grid ID from room:", gridId);

      const selectedGrid = ownerUserDoc.grids.find(g => g._id.toString() === gridId);
      if (!selectedGrid) {
        console.log("Selected grid not found:", gridId);
        socket.emit("error", { message: "Selected grid not found" });
        return;
      }

      console.log("Selected grid:", selectedGrid.title, "True index:", selectedGrid.trueStatementIndex);

      // Advance to next round and set the question
      room.roundIndex = nextIndex;
      room.selectedGridId = gridId;
      room.selectedGridOwner = selectedGridOwner;
      room.selectedGridTitle = selectedGrid.title;
      room.currentPlayerName = nextOwner.name; // Store whose grid this is
      room.questions = [{
        text: `Which statement is TRUE about ${nextOwner.name}?`,
        statements: selectedGrid.statements,
        trueStatementIndex: selectedGrid.trueStatementIndex || 0
      }];
      room.currentQuestionIndex = 0;
      room.gameStartTime = Date.now();

      console.log(`Round ${nextIndex + 1}/${room.roundOrder.length} started with grid: ${selectedGrid.title}`);
      io.to(code).emit("round-started", room);
    } catch (err) {
      console.error("Error advancing to next round:", err);
      socket.emit("error", { message: "Failed to start next round: " + err.message });
    }
  });

  socket.on("disconnect", () => {
    const roomCode = socketRooms.get(socket.id);
    if (roomCode && rooms[roomCode]) {
      console.log(`🔌 Player ${socket.id} disconnected from room ${roomCode}`);
      
      const room = rooms[roomCode];
      console.log(`   Room phase BEFORE removing player: ${room.phase}`);
      console.log(`   Room roundOrder BEFORE: [${room.roundOrder?.join(', ')}]`);
      room.players = room.players.filter(p => p.id !== socket.id);
      console.log(`   Players remaining: ${room.players.length}`);
      
      // NEVER delete rooms that are in "playing" or "finished" phase
      // Players will rejoin when they navigate to the game page
      if (room.players.length === 0) {
        if (room.phase === "playing" || room.phase === "finished") {
          console.log(`⚠️ Room ${roomCode} is empty but game is ${room.phase}, KEEPING ROOM ALIVE indefinitely`);
          console.log(`   Room state preserved: phase=${room.phase}, roundOrder=[${room.roundOrder?.join(', ')}], roundIndex=${room.roundIndex}`);
          // Don't delete the room - players will rejoin from the game page
        } else {
          console.log(`🗑️ Room ${roomCode} is empty (lobby phase), deleting it`);
          delete rooms[roomCode];
        }
      } else {
        console.log(`✅ Room ${roomCode} now has ${room.players.length} players`);
        io.to(roomCode).emit("room-update", room);
      }
    }
    socketRooms.delete(socket.id);
  });
});

// Configure CORS for Express (same origins as Socket.IO)
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

admin.initializeApp({
  "projectId": "bluff-grid-8cdfa"
});

const verifyAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;
    if (!token) return res.status(401).json({ message: 'No token' });
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ message: 'Unauthorized' });
  }
};
app.post('/api/users', verifyAuth, async (req, res) => {
  try {
    const { uid, email, username, photoUrl } = req.user;

    let user = await User.findOne({ firebaseId: uid });

    if (!user) {
      user = await User.create({
        firebaseId: uid,
        email,
        username,
        photoUrl,
      });
    }

    res.status(201).send({ success: true });
  } catch (err) {
    console.error('User creation failed:', err);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

app.post('/api/save-grid', verifyAuth, async (req, res) => {
  try {
    const { title, statements, truthIndex } = req.body;
    console.log('Save grid request:', { title, statements, truthIndex, userId: req.user.uid });
    
    // Check if truthIndex is a valid number (0-4)
    const truthIndexNum = Number(truthIndex);
    if (!title || statements?.length !== 5 || isNaN(truthIndexNum) || truthIndexNum < 0 || truthIndexNum > 4) {
      console.log('Validation failed:', { 
        title: !!title, 
        statementsLength: statements?.length, 
        truthIndex, 
        truthIndexNum,
        isNaN: isNaN(truthIndexNum)
      });
      return res.status(400).json({ message: 'Invalid payload: title, 5 statements, and truthIndex (0-4) are required' });
    }

    let user = await User.findOne({ firebaseId: req.user.uid });
    if (!user) {
      console.log('Creating new user:', req.user.uid);
      user = await User.create({
        firebaseId: req.user.uid,
        email: req.user.email,
      });
    }

    // Use $push with findOneAndUpdate to avoid subdocument validation issues
    const gridToAdd = {
      title: title,
      statements: statements,
      trueStatementIndex: truthIndexNum,
      createdAt: new Date()
    };

    console.log('Grid to add:', gridToAdd);

    const updatedUser = await User.findOneAndUpdate(
      { firebaseId: req.user.uid },
      { $push: { grids: gridToAdd } },
      { new: true, runValidators: true }
    );
    
    console.log('Grid saved successfully for user:', req.user.uid);
    const savedGrid = updatedUser.grids[updatedUser.grids.length - 1];
    res.json({ message: 'OK', grid: savedGrid });
  } catch (err) {
    console.error('Error saving grid:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/api/grids', verifyAuth, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseId: req.user.uid }, { grids: 1, _id: 0 });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.grids);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/grids/:id', verifyAuth, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseId: req.user.uid });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.grids = user.grids.filter(g => g._id.toString() !== req.params.id);
    await user.save();

    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server ready on port ${PORT}`);
      console.log(`📡 Socket.IO server is running`);
    });
  })
  .catch((err) => {
    console.error('MongoDB error:', err);
    process.exit(1);
  });
