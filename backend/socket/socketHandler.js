const Quiz = require('../models/Quiz');

const games = {};

const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Create Game
        socket.on('create_game', async ({ quizId }) => {
            try {
                const quiz = await Quiz.findById(quizId);
                if (!quiz) {
                    socket.emit('error', { message: 'Quiz not found' });
                    return;
                }

                let roomCode = generateRoomCode();
                while (games[roomCode]) {
                    roomCode = generateRoomCode();
                }

                games[roomCode] = {
                    quizId,
                    hostSocketId: socket.id,
                    players: [],
                    gameState: 'LOBBY',
                    currentQuestionIndex: 0,
                    answers: {}, // { questionIndex: { playerId: answer } }
                    quizData: quiz
                };

                socket.join(roomCode);
                socket.emit('game_created', { roomCode });
                console.log(`Game created: ${roomCode} for quiz ${quizId}`);

            } catch (error) {
                console.error('Error creating game:', error);
                socket.emit('error', { message: 'Failed to create game' });
            }
        });

        // Helper to handle question end
        const handleQuestionEnd = (roomCode) => {
            const game = games[roomCode];
            if (!game) return;

            clearInterval(game.timer);
            game.gameState = 'LEADERBOARD'; // Or FEEDBACK if you want to show correct answer first
            io.to(roomCode).emit('all_answered'); // Trigger frontend transition
        };

        // Helper to start timer
        const startQuestionTimer = (roomCode, duration) => {
            const game = games[roomCode];
            if (!game) return;

            if (game.timer) clearInterval(game.timer);

            let timeLeft = duration;
            game.timer = setInterval(() => {
                timeLeft--;
                io.to(roomCode).emit('timer_update', timeLeft);

                if (timeLeft <= 0) {
                    handleQuestionEnd(roomCode);
                }
            }, 1000);
        };

        // Helper to send question
        const sendQuestion = (roomCode, game) => {
            const question = game.quizData.questions[game.currentQuestionIndex];

            // Format options for frontend (array of strings -> array of objects)
            const formattedOptions = question.options.map((opt, index) => ({
                id: index, // Using index as ID since simple string array
                text: opt
            }));

            const timeLimit = question.timeLimit || game.quizData.timeLimitPerQuestion || 20;

            io.to(roomCode).emit('new_question', {
                question: {
                    text: question.questionText,
                    options: formattedOptions,
                    timeLimit: timeLimit
                },
                questionIndex: game.currentQuestionIndex,
                totalQuestions: game.quizData.questions.length
            });

            // Start Server Side Timer
            startQuestionTimer(roomCode, timeLimit);
        };

        // Join Room
        socket.on('join_room', ({ roomCode, playerName }) => {
            const game = games[roomCode];
            if (!game) {
                socket.emit('error', { message: 'Room not found' });
                return;
            }

            // Check for existing player (Reconnection Logic)
            const existingPlayer = game.players.find(p => p.name === playerName);
            if (existingPlayer) {
                // RECONNECT: Update their socket ID to the new one
                console.log(`Player ${playerName} reconnected. Updating ID.`);
                existingPlayer.id = socket.id;
                existingPlayer.isOnline = true;
                socket.join(roomCode);

                // Send them the current state immediately
                socket.emit('reconnect_success', {
                    score: existingPlayer.score
                });

                // If game is in progress, send current question
                if (game.gameState === 'QUESTION') {
                    const question = game.quizData.questions[game.currentQuestionIndex];
                    const formattedOptions = question.options.map((opt, index) => ({
                        id: index,
                        text: opt
                    }));

                    socket.emit('new_question', {
                        question: {
                            text: question.questionText,
                            options: formattedOptions,
                            timeLimit: question.timeLimit || game.quizData.timeLimitPerQuestion || 20
                        },
                        questionIndex: game.currentQuestionIndex,
                        totalQuestions: game.quizData.questions.length
                    });
                }

                return;
            }

            if (game.gameState !== 'LOBBY') {
                socket.emit('error', { message: 'Game already started' });
                return;
            }

            game.players.push({ id: socket.id, name: playerName, score: 0, isOnline: true });
            socket.join(roomCode);

            // Notify everyone in the room (including the new player)
            io.to(roomCode).emit('player_joined', game.players);
            console.log(`${playerName} joined room ${roomCode}`);
        });

        // Start Game
        socket.on('start_game', (roomCode) => {
            const game = games[roomCode];
            if (!game) return;

            if (socket.id !== game.hostSocketId) {
                socket.emit('error', { message: 'Only host can start game' });
                return;
            }

            game.gameState = 'QUESTION';
            io.to(roomCode).emit('game_started', game);
            console.log(`Game started in room ${roomCode}`);

            sendQuestion(roomCode, game);
        });

        // Submit Answer
        socket.on('submit_answer', ({ roomCode, answer, questionIndex }) => {
            try {
                const game = games[roomCode];
                if (!game) return;

                // 1. Find player
                const player = game.players.find(p => p.id === socket.id);
                if (!player) return;

                // 2. Initialize answers object for this question if not exists
                if (!game.answers[questionIndex]) {
                    game.answers[questionIndex] = {};
                }

                // Prevent multiple answers from same player for same question
                if (game.answers[questionIndex][socket.id] !== undefined) return;

                // 3. Process Answer
                game.answers[questionIndex][socket.id] = answer;

                // 4. Acknowledgment
                socket.emit('answer_received');

                // Check correctness
                const question = game.quizData.questions[questionIndex];
                const isCorrect = answer === question.correctOptionIndex;

                // Update score
                if (isCorrect) {
                    player.score += 1000; // Simple scoring
                    console.log(`Player ${player.name} score updated to ${player.score}`);
                }

                // Emit result to player
                socket.emit('answer_result', {
                    isCorrect,
                    score: player.score,
                    correctOption: question.correctOptionIndex
                });

                // Notify room of updated scores
                io.to(roomCode).emit('update_players', game.players);

                // 5. Check if all players answered
                const answeredCount = Object.keys(game.answers[questionIndex]).length;
                if (answeredCount === game.players.length) {
                    handleQuestionEnd(roomCode);
                }
            } catch (error) {
                console.error("Submit Answer Error:", error);
            }
        });

        // Next Question
        socket.on('next_question', (roomCode) => {
            const game = games[roomCode];
            if (!game) return;

            if (socket.id !== game.hostSocketId) {
                return;
            }

            game.currentQuestionIndex++;

            if (game.currentQuestionIndex >= game.quizData.questions.length) {
                game.gameState = 'FINISHED';
                if (game.timer) clearInterval(game.timer); // Clear timer if exists
                const leaderboard = game.players.sort((a, b) => b.score - a.score);
                io.to(roomCode).emit('game_over', {
                    leaderboard,
                    quizId: game.quizId
                });
            } else {
                sendQuestion(roomCode, game);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);

            for (const roomCode in games) {
                const game = games[roomCode];

                if (game && game.hostSocketId === socket.id) {
                    console.log(`Host disconnected from room ${roomCode}`);
                }
            }
        });
    });
};

module.exports = socketHandler;
