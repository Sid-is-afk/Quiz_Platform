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

        // Join Room
        socket.on('join_room', ({ roomCode, playerName }) => {
            const game = games[roomCode];
            if (!game) {
                socket.emit('error', { message: 'Room not found' });
                return;
            }

            if (game.gameState !== 'LOBBY') {
                socket.emit('error', { message: 'Game already started' });
                return;
            }

            // Check for duplicate names
            if (game.players.some(p => p.name === playerName)) {
                socket.emit('error', { message: 'Name already taken' });
                return;
            }

            game.players.push({ id: socket.id, name: playerName, score: 0 });
            socket.join(roomCode);

            // Notify everyone in the room (including the new player)
            io.to(roomCode).emit('player_joined', game.players);
            console.log(`${playerName} joined room ${roomCode}`);
        });

        // Helper to send question
        const sendQuestion = (roomCode, game) => {
            const question = game.quizData.questions[game.currentQuestionIndex];

            // Format options for frontend (array of strings -> array of objects)
            const formattedOptions = question.options.map((opt, index) => ({
                id: index, // Using index as ID since simple string array
                text: opt
            }));

            io.to(roomCode).emit('new_question', {
                question: {
                    text: question.questionText,
                    options: formattedOptions,
                    timeLimit: question.timeLimit || game.quizData.timeLimitPerQuestion || 20
                },
                questionIndex: game.currentQuestionIndex,
                totalQuestions: game.quizData.questions.length
            });
        };

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
            const game = games[roomCode];
            if (!game) return;

            // Initialize answers object for this question if not exists
            if (!game.answers[questionIndex]) {
                game.answers[questionIndex] = {};
            }

            // Prevent multiple answers from same player for same question
            if (game.answers[questionIndex][socket.id] !== undefined) return;

            game.answers[questionIndex][socket.id] = answer;

            // Check correctness
            const question = game.quizData.questions[questionIndex];
            // answer is the index sent from frontend
            const isCorrect = answer === question.correctOptionIndex;

            // Update score
            const player = game.players.find(p => p.id === socket.id);
            if (player && isCorrect) {
                player.score += 1000; // Simple scoring
                console.log(`Player ${player.name} score updated to ${player.score}`);
            }

            // Emit result to player
            socket.emit('answer_result', {
                isCorrect,
                score: player ? player.score : 0
            });

            // Notify room of updated scores
            io.to(roomCode).emit('update_players', game.players);

            // Check if all players answered
            const answeredCount = Object.keys(game.answers[questionIndex]).length;
            if (answeredCount === game.players.length) {
                io.to(roomCode).emit('all_answered');
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
                const leaderboard = game.players.sort((a, b) => b.score - a.score);
                io.to(roomCode).emit('game_over', { leaderboard });
            } else {
                sendQuestion(roomCode, game);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);

            for (const roomCode in games) {
                const game = games[roomCode];

                // If host disconnects, maybe end game? For now just log it.
                if (game.hostSocketId === socket.id) {
                    console.log(`Host disconnected from room ${roomCode}`);
                    // Optional: io.to(roomCode).emit('host_disconnected');
                }

                const playerIndex = game.players.findIndex(p => p.id === socket.id);
                if (playerIndex !== -1) {
                    game.players.splice(playerIndex, 1);
                    io.to(roomCode).emit('player_left', game.players);

                    // If room is empty and host is gone, delete it
                    if (game.players.length === 0 && game.hostSocketId === socket.id) { // Or just check if empty?
                        // Ideally keep room for a bit if host reconnects, but for prototype delete if empty
                    }

                    // Clean up empty rooms
                    if (game.players.length === 0 && !io.sockets.adapter.rooms.get(roomCode)) {
                        delete games[roomCode];
                        console.log(`Room ${roomCode} deleted`);
                    }
                    break;
                }
            }
        });
    });
};

module.exports = socketHandler;
