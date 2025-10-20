# Bluff Grid Game

A multiplayer bluff game where players answer questions about themselves and others try to guess which statements are true.

## Features

### Lobby System

- Players can join rooms using a game code
- Host controls the game setup
- Players can mark themselves as "Ready" or "Not Ready"
- Host can only start the game when all players are ready

### Game System

- Multiple question grids available:
  - My childhood
  - Travel memories
  - Favorite foods
  - Random
- Questions are displayed to all players simultaneously
- Timer-based gameplay (60 seconds per question)
- Players submit answers through the interface

### Technical Features

- Real-time WebSocket communication
- Room-based multiplayer system
- Game state management on the backend
- Responsive UI with modern design

## How to Play

1. **Join a Game**: Enter a game code or create a new room
2. **Get Ready**: Click the "Ready" button to indicate you're ready to play
3. **Wait for Host**: The host will see when all players are ready
4. **Start Game**: Host clicks "Start Game" to begin
5. **Answer Questions**: Read each statement and select which one is true about you
6. **Complete Game**: Answer all questions to finish the game

## Setup

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Game Flow

1. **Lobby Phase**: Players join and get ready
2. **Game Start**: Host starts game when everyone is ready
3. **Question Phase**: Questions are displayed one by one
4. **Answer Phase**: Players submit their answers
5. **Game End**: All questions completed

## Socket Events

- `join-room`: Join a game room
- `toggle-ready`: Toggle ready status
- `start-game`: Host starts the game
- `submit-answer`: Submit answer to current question
- `room-update`: Room state updates
- `game-started`: Game has begun
- `next-question`: Move to next question
- `game-finished`: Game has ended
