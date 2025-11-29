import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { Check, X, Clock, Loader2, ArrowRight } from 'lucide-react';
import { io } from 'socket.io-client';
import { API_URL } from '../config';

const PlayerGame = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [gameCode, setGameCode] = useState(location.state?.gameCode || sessionStorage.getItem('quiz_room_code') || '');

    const [socket, setSocket] = useState(null);
    const [gameState, setGameState] = useState('JOINING'); // JOINING, LOBBY, QUESTION, FEEDBACK, FINISHED
    const [playerName, setPlayerName] = useState(sessionStorage.getItem('quiz_player_name') || '');
    const [error, setError] = useState(null);
    const [score, setScore] = useState(0);
    const [isCorrect, setIsCorrect] = useState(false);

    // Game Data
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [correctOption, setCorrectOption] = useState(null);

    useEffect(() => {
        const newSocket = io(API_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
            // Auto-rejoin if we have data
            if (gameCode && playerName) {
                newSocket.emit('join_room', { roomCode: gameCode, playerName });
            }
        });

        newSocket.on('error', (data) => {
            setError(data.message);
        });

        newSocket.on('player_joined', (players) => {
            setGameState('LOBBY');
            setError(null);
        });

        newSocket.on('reconnect_success', (data) => {
            console.log('Reconnected successfully');
            setScore(data.score);
            setGameState('LOBBY'); // Or whatever state is appropriate, usually server sends new_question immediately if active
        });

        newSocket.on('new_question', (data) => {
            setGameState('QUESTION');
            setCurrentQuestion(data.question);
            setCurrentQuestionIndex(data.questionIndex);
            setTotalQuestions(data.totalQuestions);
            setTimeLeft(data.question.timeLimit);
            setSelectedOption(null);
            setCorrectOption(null);
            setIsCorrect(false);
        });

        newSocket.on('timer_update', (time) => {
            setTimeLeft(time);
        });

        newSocket.on('answer_result', (data) => {
            setIsCorrect(data.isCorrect);
            setScore(data.score);
            setCorrectOption(data.correctOption);
            setGameState('FEEDBACK');
        });

        newSocket.on('game_over', (data) => {
            console.log('Game Over event received:', data);
            setGameState('FINISHED');

            // Find my score from leaderboard using socket.id (best) or name (fallback)
            const myScoreEntry = data.leaderboard.find(p => p.id === newSocket.id) ||
                data.leaderboard.find(p => p.name === playerName);

            const finalScore = myScoreEntry ? myScoreEntry.score : 0;
            console.log("Server says my score is:", finalScore);

            navigate('/results', {
                state: {
                    leaderboard: data.leaderboard,
                    score: finalScore,
                    quizId: data.quizId,
                    playerName: playerName
                }
            });
        });

        return () => newSocket.disconnect();
    }, []);

    const handleJoin = (e) => {
        e.preventDefault();
        if (!playerName.trim() || !gameCode.trim()) {
            setError('Please enter your name and game code');
            return;
        }

        sessionStorage.setItem('quiz_player_name', playerName);
        sessionStorage.setItem('quiz_room_code', gameCode);

        if (socket) {
            socket.emit('join_room', { roomCode: gameCode, playerName });
        }
    };

    const handleAnswer = (e, optionId) => {
        e.preventDefault(); // STOPS PAGE RELOAD
        e.stopPropagation();

        if (gameState !== 'QUESTION' || selectedOption !== null) return;

        setSelectedOption(optionId);

        if (socket) {
            socket.emit('submit_answer', {
                roomCode: gameCode,
                answer: optionId,
                questionIndex: currentQuestionIndex
            });
        }
    };

    const getOptionColor = (index) => {
        const colors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'];
        return colors[index % 4];
    };

    const getOptionIcon = (index) => {
        const icons = ['▲', '◆', '●', '■'];
        return icons[index % 4];
    };

    if (gameState === 'JOINING') {
        return (
            <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full"
                >
                    <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Join Game</h1>
                    {error && (
                        <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-center">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleJoin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nickname</label>
                            <input
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none text-lg"
                                placeholder="Enter your name"
                                maxLength={12}
                                required
                            />
                        </div>
                        {/* If gameCode is not passed via state, we might need an input for it. 
                            Assuming it's passed or stored for now. If not, add input here. */}
                        {!location.state?.gameCode && !sessionStorage.getItem('quiz_room_code') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Game Code</label>
                                <input
                                    type="text"
                                    value={gameCode}
                                    onChange={(e) => setGameCode(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none text-lg"
                                    placeholder="Enter game code"
                                    required
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-3 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                        >
                            Join Lobby <ArrowRight size={20} />
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    if (gameState === 'LOBBY') {
        return (
            <div className="min-h-screen bg-primary flex flex-col items-center justify-center text-white p-4 text-center">
                <h1 className="text-4xl font-bold mb-8">You're in!</h1>
                <div className="w-24 h-24 relative mb-4">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-white rounded-full opacity-20"
                    />
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl">
                        {playerName.charAt(0).toUpperCase()}
                    </div>
                </div>
                <p className="text-xl">See your nickname on screen?</p>
                <p className="mt-4 opacity-70">Waiting for host to start...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Feedback Overlay */}
            <AnimatePresence>
                {gameState === 'FEEDBACK' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${isCorrect ? 'bg-success' : 'bg-red-600'
                            } text-white`}
                    >
                        {isCorrect && <Confetti numberOfPieces={200} recycle={false} />}
                        <motion.div
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            className="text-center"
                        >
                            <div className="text-8xl mb-4">
                                {isCorrect ? <Check size={120} /> : <X size={120} />}
                            </div>
                            <h2 className="text-5xl font-black mb-2">
                                {isCorrect ? 'Correct!' : 'Incorrect'}
                            </h2>
                            <p className="text-2xl font-bold opacity-80">
                                {isCorrect ? '+1000 Points' : 'Better luck next time'}
                            </p>
                            <p className="mt-8 text-xl animate-pulse">Waiting for next question...</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex justify-between items-center px-6">
                <div className="flex items-center gap-2 font-bold text-gray-600">
                    <span className="bg-gray-100 px-3 py-1 rounded-lg">
                        {currentQuestionIndex + 1} / {totalQuestions}
                    </span>
                </div>
                <div className="font-bold text-xl text-primary">Score: {score}</div>
            </div>

            {/* Question Area */}
            {currentQuestion && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full">
                    {/* Timer */}
                    <div className="mb-8 relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-gray-200"
                            />
                            <motion.circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className={`${timeLeft < 10 ? 'text-red-500' : 'text-primary'}`}
                                initial={{ pathLength: 1 }}
                                animate={{ pathLength: timeLeft / currentQuestion.timeLimit }}
                                transition={{ duration: 1, ease: "linear" }}
                            />
                        </svg>
                        <span className="absolute text-2xl font-bold text-gray-700">{timeLeft}</span>
                    </div>

                    <h2 className="text-2xl md:text-4xl font-bold text-center text-gray-800 mb-12">
                        {currentQuestion.text}
                    </h2>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        {currentQuestion.options.map((opt, index) => (
                            <motion.button
                                key={opt.id}
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={(e) => handleAnswer(e, opt.id)}
                                disabled={selectedOption !== null}
                                className={`${getOptionColor(index)} p-8 rounded-2xl text-white text-left shadow-lg hover:shadow-xl transition-all relative overflow-hidden group ${selectedOption !== null && selectedOption !== opt.id ? 'opacity-50' : ''}`}
                            >
                                <div className="absolute top-4 left-4 opacity-50 text-2xl font-black">
                                    {getOptionIcon(index)}
                                </div>
                                <span className="text-xl md:text-2xl font-bold block text-center mt-2">
                                    {opt.text}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerGame;
