# AI Quiz Platform

> **Real-time, Multiplayer, AI-Powered Quiz Experience**

**[🚀 Live Demo](https://quizplatformiit.vercel.app)**

## 1. Project Overview
The **AI Quiz Platform** is a cutting-edge, real-time multiplayer quiz application that leverages **Google's Gemini AI** to generate dynamic quizzes on any topic. Designed with a futuristic, "Glassmorphism" UI, it offers a seamless experience for hosts to create games and players to join via room codes.

**Key Features:**
-   **AI-Generated Quizzes:** Instantly create quizzes by topic or by uploading PDF/Image files using Gemini AI.
-   **Real-Time Multiplayer:** Built with Socket.io for synchronized game states, live leaderboards, and instant feedback.
-   **Futuristic UI:** A premium, dark-mode interface with smooth animations (Framer Motion) and responsive design.
-   **Live Leaderboard:** Tracks scores in real-time with a competitive edge.

## 2. Architecture Overview
The platform follows a modern **Client-Server** architecture with a **Real-time Event Loop**.

-   **Frontend (Client):** Built with **React (Vite)** and **Tailwind CSS**. It handles the UI, animations, and maintains a persistent WebSocket connection to the server.
-   **Backend (Server):** Built with **Node.js** and **Express**. It manages API endpoints for quiz generation and storage.
-   **Real-Time Layer:** **Socket.io** manages the "Game Loop" (Lobby -> Question -> Leaderboard -> Game Over), syncing state across all connected clients.
-   **Database:** **MongoDB Atlas** stores quiz data (questions, options, answers).
-   **AI Engine:** **Google Gemini API** processes prompts and files to generate structured quiz JSON.

## 3. Setup Instructions

### Prerequisites
-   **Node.js** (v18 or higher)
-   **MongoDB Atlas** Connection String
-   **Google Gemini API Key**

### Installation

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd ai-quiz-platform
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend` directory:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    GEMINI_API_KEY=your_gemini_api_key
    NODE_ENV=development
    ```

3.  **Frontend Setup**
    ```bash
    # Return to root (frontend is in the root directory)
    cd .. 
    npm install
    ```
    Create a `.env` file in the root directory:
    ```env
    VITE_BACKEND_URL=http://localhost:5000
    ```

## 4. How to Run Locally

1.  **Start the Backend Server**
    ```bash
    cd backend
    npm start
    # Or for development with auto-reload:
    npm run dev
    ```
    *Server will run on http://localhost:5000*

2.  **Start the Frontend Client**
    Open a new terminal:
    ```bash
    # From the root directory
    npm run dev
    ```
    *Client will run on http://localhost:5173*

## 5. APIs & Endpoints

### Quiz Management
-   **`POST /api/quizzes/generate`**
    -   **Description:** Generates a new quiz using Gemini AI based on a topic.
    -   **Payload:** `{ "topic": "Space", "difficulty": "Hard", "amount": 5, "timeLimit": 20 }`
    -   **Response:** JSON object containing the generated quiz questions.

-   **`POST /api/quizzes/generate-from-file`**
    -   **Description:** Generates a quiz from an uploaded PDF or Image.
    -   **Payload:** `FormData` with `file` (PDF/Image), `amount`, `timeLimit`.

-   **`POST /api/quizzes/save`**
    -   **Description:** Saves a generated quiz to the database.
    -   **Payload:** Quiz Object (title, questions, etc.)
    -   **Response:** `{ "id": "quiz_id" }`

-   **`GET /api/quizzes/:id`**
    -   **Description:** Retrieves a specific quiz by ID.

## 6. Socket Events
The platform uses **Socket.io** for real-time communication.

-   **`create_game`**: Host initiates a new game lobby.
-   **`join_room`**: Player joins a lobby using a room code.
-   **`start_game`**: Host starts the quiz, transitioning state to `QUESTION`.
-   **`submit_answer`**: Player submits an answer; server validates and updates score.
-   **`next_question`**: Host advances to the next question.
-   **`game_over`**: Server signals the end of the quiz and sends final leaderboard.
-   **`timer_update`**: Server broadcasts remaining time for the current question.

## 7. List of Dependencies

### Frontend
-   **Core:** `react`, `react-dom`, `react-router-dom`, `vite`
-   **Styling:** `tailwindcss`, `postcss`, `autoprefixer`, `lucide-react`
-   **Animation:** `framer-motion`, `react-confetti`
-   **Utilities:** `socket.io-client`, `html2canvas`, `react-qr-code`

### Backend
-   **Core:** `express`, `mongoose`, `dotenv`, `cors`
-   **Real-Time:** `socket.io`, `socket.io-client`
-   **AI & Processing:** `@google/generative-ai`, `multer`, `pdf-parse`

## 8. Contributors
[To be added]
