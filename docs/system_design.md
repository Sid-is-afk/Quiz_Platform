# System Design

## 1. Architecture Description
The AI Quiz Platform operates on a **Client-Server** model enhanced with **WebSockets** for real-time bi-directional communication.

-   **Client (Frontend):** A Single Page Application (SPA) built with React. It manages the user interface for both Hosts (creating quizzes, managing lobbies) and Players (joining games, answering questions). It maintains a persistent connection to the server via Socket.io.
-   **Server (Backend):** An Express.js application that serves two main roles:
    1.  **REST API:** Handles stateless operations like generating quizzes via Gemini AI and saving/retrieving them from MongoDB.
    2.  **Socket Server:** Manages the stateful "Game Loop". It keeps track of active rooms, player scores, current question index, and timers in memory.
-   **Database:** MongoDB stores persistent data such as Quiz templates. Active game sessions are currently stored in-memory on the server for speed.

## 2. Database Schema

### Quiz Model
Stores the structure of a generated quiz.
```json
{
  "title": "String",
  "topic": "String",
  "difficulty": "String",
  "questions": [
    {
      "questionText": "String",
      "options": ["String", "String", "String", "String"],
      "correctOptionIndex": "Number", // 0-3
      "timeLimit": "Number" // Seconds
    }
  ],
  "createdAt": "Date"
}
```

*Note: User sessions and active game states (scores, current question) are stored in the server's memory (`games` object) and are not persisted to the database to ensure low latency.*

## 3. WebSocket "Game Loop" Logic
The core gameplay relies on a synchronized loop managed by the server.

1.  **Lobby State:**
    -   Host creates a room -> Server generates `roomCode`.
    -   Players join -> Server adds them to `games[roomCode].players`.
    -   Server broadcasts `player_joined` to update the lobby UI.

2.  **Question State:**
    -   Host starts game -> Server changes state to `QUESTION`.
    -   Server sends `new_question` event with the current question data.
    -   **Server-Side Timer:** The server starts a `setInterval` timer. It emits `timer_update` every second. This prevents client-side manipulation of time.

3.  **Answer Processing:**
    -   Player submits answer -> Server validates against `correctOptionIndex`.
    -   If correct, server increments player score (e.g., +1000 points).
    -   Server waits for all players to answer OR for the timer to hit 0.

4.  **Transition:**
    -   When round ends, Server emits `all_answered` or triggers the next phase.
    -   Host requests `next_question` -> Cycle repeats.

5.  **Game Over:**
    -   After the last question, Server calculates final rankings.
    -   Emits `game_over` with the full leaderboard.
