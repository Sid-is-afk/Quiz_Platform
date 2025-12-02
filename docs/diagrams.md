# System Diagrams

## 1. Sequence Diagram: Generating a Quiz
This diagram illustrates the flow when a user requests a new AI-generated quiz.

```mermaid
sequenceDiagram
    participant User
    participant Client as React Client
    participant API as Express API
    participant AI as Gemini AI
    participant DB as MongoDB

    User->>Client: Enters Topic & Difficulty
    Client->>API: POST /api/quizzes/generate
    API->>AI: Send Prompt (Topic, Difficulty)
    AI-->>API: Return JSON Quiz Data
    API-->>Client: Return Quiz Questions
    User->>Client: Reviews & Edits Quiz
    User->>Client: Clicks "Save Quiz"
    Client->>API: POST /api/quizzes/save
    API->>DB: Insert Quiz Document
    DB-->>API: Return Quiz ID
    API-->>Client: Success (Quiz ID)
```

## 2. State Diagram: Game States
This diagram shows the lifecycle of a game session managed by the Socket.io server.

```mermaid
stateDiagram-v2
    [*] --> LOBBY: Host Creates Game
    LOBBY --> QUESTION_ACTIVE: Host Starts Game
    
    state QUESTION_ACTIVE {
        [*] --> TIMER_RUNNING
        TIMER_RUNNING --> ALL_ANSWERED: All Players Submitted
        TIMER_RUNNING --> TIME_UP: Timer reaches 0
    }

    QUESTION_ACTIVE --> LEADERBOARD: Round Ends
    LEADERBOARD --> QUESTION_ACTIVE: Host Clicks "Next Question"
    LEADERBOARD --> GAME_OVER: Last Question Completed
    
    GAME_OVER --> [*]
```
