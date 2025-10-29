# Bug Fixes - October 4, 2025

## Issues Fixed

### 🐛 Issue 1: "Room not found" when clicking "Next Player Grid"

**Problem:** Console showed "Room not found" error when host clicked the button
**Root Cause:** Frontend was using `roomData?.code` which was undefined. The room code is in the URL, not in the roomData object.
**Solution:**

- Extract room code from URL query parameters
- Use `roomCode` instead of `roomData?.code` in socket emissions
- Added logging to help debug

**Files Modified:**

- `frontend/src/Pages/game/game.jsx`

### 🐛 Issue 2: Vote counts showing "0 votes" for all answers

**Problem:** Even after clicking an answer, all options showed "0 votes"
**Root Cause:** Backend was using `currentQuestionIndex` to track answers, but this resets to 0 for each round. This meant each round was overwriting the previous round's answers.
**Solution:**

- Use `roundIndex` instead of `currentQuestionIndex` to store answers per round
- Each round now has its own entry in the answers/scores arrays
- Vote counts now properly accumulate as players submit answers

**Files Modified:**

- `backend/server.js` (submit-answer handler)

### 🐛 Issue 3: Scores not calculated/shown on leaderboard

**Problem:** Leaderboard not showing correct scores
**Root Cause:** Same as Issue 2 - scores were being overwritten each round instead of accumulated
**Solution:**

- Scores now stored at `player.scores[roundIndex]`
- Total score calculated as sum of all rounds: `scores.reduce((sum, score) => sum + score, 0)`
- Added logging to show each player's score when game ends

**Files Modified:**

- `backend/server.js` (submit-answer and next-player-grid handlers)

---

## How It Works Now

### Answer Submission Flow:

1. Player clicks an answer
2. Frontend emits `submit-answer` with room code and answer index
3. Backend stores answer at `player.answers[roundIndex]`
4. Backend calculates score and stores at `player.scores[roundIndex]`
5. Backend counts votes for each option
6. Backend emits vote counts to all players
7. Players see real-time vote counts update

### Round Progression:

1. Host clicks "Next Player Grid"
2. Backend increments `roundIndex`
3. Backend fetches next player's grid from MongoDB
4. Backend emits `round-started` with new grid
5. All players see new statements
6. Answers/scores accumulate in arrays by round index

### Game End:

1. After last round, `roundIndex >= roundOrder.length`
2. Backend calculates `totalScore` for each player
3. Backend emits `game-finished` event
4. Frontend navigates to leaderboard
5. Leaderboard shows sorted players with total scores

---

## Testing Checklist

✅ **Test 1: Next Player Grid Button**

- [ ] Start game with 2+ players
- [ ] All players answer Round 1
- [ ] Host clicks "Next Player Grid"
- [ ] Round 2 should start with different player's grid
- [ ] Console should show: "Round 2/X started with grid: [title]"

✅ **Test 2: Vote Counts**

- [ ] Start game
- [ ] Player 1 clicks answer A
- [ ] Answer A should show "1 vote"
- [ ] Player 2 clicks answer B
- [ ] Answer A shows "1 vote", Answer B shows "1 vote"
- [ ] After all answer, totals should match player count

✅ **Test 3: Score Tracking**

- [ ] Play multiple rounds
- [ ] Check console logs for score per round
- [ ] After game ends, check leaderboard
- [ ] Total scores should equal correct answers across all rounds

---

## Console Logs to Watch

### When answer is submitted:

```
Player [Name] answered correctly/incorrectly in round X (selected Y, correct is Z): N point(s)
Vote counts after [Name]'s answer: [array]
```

### When round advances:

```
Advancing from round X to Y. Total rounds: Z
Round Y/Z started with grid: [Title]
```

### When game ends:

```
All rounds complete, finishing game
Player [Name]: X points (scores: [array])
Emitting game-finished event
```

---

## Server Status

✅ All fixes applied
✅ Server running with enhanced logging
✅ Ready to test
