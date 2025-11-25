const games = {};

const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Create Room
        socket.on('create_room', ({ roomCode, quizId, hostName }) => {
            if (games[roomCode]) {
                socket.emit('error', { message: 'Room already exists' });
                return;
            }

            games[roomCode] = {
                quizId,
                hostSocketId: socket.id,
                players: [{ id: socket.id, name: hostName, score: 0 }],
                gameState: 'LOBBY',
                currentQuestionIndex: 0,
                answers: {} // { questionIndex: { playerId: answer } }
            };

            socket.join(roomCode);
            io.to(roomCode).emit('room_created', games[roomCode]);
            console.log(`Room ${roomCode} created by ${hostName}`);
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

            game.players.push({ id: socket.id, name: playerName, score: 0 });
            socket.join(roomCode);
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
        });

        // Submit Answer
        socket.on('submit_answer', ({ roomCode, answer, questionIndex }) => {
            const game = games[roomCode];
            if (!game) return;

            // Initialize answers object for this question if not exists
            if (!game.answers[questionIndex]) {
                game.answers[questionIndex] = {};
            }

            game.answers[questionIndex][socket.id] = answer;

            // Check if all players answered (simple logic)
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
            // Logic to check if game over would go here

            io.to(roomCode).emit('next_question', game.currentQuestionIndex);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            // Handle cleanup if needed (remove player from game, etc.)
            // For simplicity, we'll leave it for now or implement basic cleanup
            for (const roomCode in games) {
                const game = games[roomCode];
                const playerIndex = game.players.findIndex(p => p.id === socket.id);
                if (playerIndex !== -1) {
                    game.players.splice(playerIndex, 1);
                    io.to(roomCode).emit('player_left', game.players);
                    if (game.players.length === 0) {
                        delete games[roomCode];
                    }
                    break;
                }
            }
        });
    });
};

module.exports = socketHandler;
