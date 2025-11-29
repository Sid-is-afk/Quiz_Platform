import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { Check, X, Clock, Loader2, ArrowRight, Trophy } from 'lucide-react';
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
        // Futuristic gradients
        const colors = [
            'from-cyan-500/20 to-blue-600/20 border-cyan-500/50 hover:border-cyan-400',
            'from-purple-500/20 to-pink-600/20 border-purple-500/50 hover:border-purple-400',
            'from-yellow-500/20 to-orange-600/20 border-yellow-500/50 hover:border-yellow-400',
            'from-green-500/20 to-emerald-600/20 border-green-500/50 hover:border-green-400'
        ];
        return colors[index % 4];
    };

    const getOptionIcon = (index) => {
        const icons = ['▲', '◆', '●', '■'];
        return icons[index % 4];
    };

    if (gameState === 'JOINING') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card p-10 max-w-md w-full"
                >
                    <h1 className="text-3xl font-bold text-center mb-8 text-white tracking-wide">JOIN PROTOCOL</h1>
                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 text-center text-sm">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleJoin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-cyan-400 mb-2 uppercase tracking-wider">Identity</label>
                            <input
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                className="glass-input w-full px-4 py-4 rounded-xl text-lg"
                                placeholder="ENTER NICKNAME"
                                maxLength={12}
                                required
                            />
                        </div>
                        {/* If gameCode is not passed via state, we might need an input for it. 
                            Assuming it's passed or stored for now. If not, add input here. */}
                        {!location.state?.gameCode && !sessionStorage.getItem('quiz_room_code') && (
                            <div>
                                <label className="block text-sm font-bold text-cyan-400 mb-2 uppercase tracking-wider">Access Code</label>
                                <input
                                    type="text"
                                    value={gameCode}
                                    onChange={(e) => setGameCode(e.target.value)}
                                    className="glass-input w-full px-4 py-4 rounded-xl text-lg"
                                    placeholder="ENTER CODE"
                                    required
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
                        >
                            CONNECT <ArrowRight size={20} />
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    if (gameState === 'LOBBY') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white p-6 text-center relative z-10">
                <h1 className="text-5xl font-black mb-12 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 drop-shadow-lg">
                    ACCESS GRANTED
                </h1>
                <div className="w-32 h-32 relative mb-8">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-cyan-500 rounded-full opacity-20 blur-xl"
                    />
                    <div className="absolute inset-0 flex items-center justify-center font-black text-4xl bg-white/10 rounded-full border border-white/20 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                        {playerName.charAt(0).toUpperCase()}
                    </div>
                </div>
                <p className="text-2xl font-bold text-white mb-2">{playerName}</p>
                <p className="text-cyan-400 font-mono animate-pulse">WAITING FOR HOST SIGNAL...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Feedback Overlay */}
            <AnimatePresence>
                {gameState === 'FEEDBACK' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${isCorrect ? 'bg-green-600/90' : 'bg-red-600/90'
                            } backdrop-blur-xl text-white`}
                    >
                        {isCorrect && <Confetti numberOfPieces={200} recycle={false} />}
                        <motion.div
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            className="text-center"
                        >
                            <div className="text-9xl mb-6 drop-shadow-lg">
                                {isCorrect ? <Check size={140} className="text-white" /> : <X size={140} className="text-white" />}
                            </div>
                            <h2 className="text-6xl font-black mb-4 tracking-tight drop-shadow-md">
                                {isCorrect ? 'CORRECT' : 'INCORRECT'}
                            </h2>
                            <p className="text-3xl font-bold opacity-90 mb-8">
                                {isCorrect ? '+1000 POINTS' : 'SYSTEM FAILURE'}
                            </p>
                            <div className="flex items-center justify-center gap-3 text-xl font-mono animate-pulse">
                                <Loader2 className="animate-spin" /> SYNCHRONIZING...
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="glass-card m-4 p-4 flex justify-between items-center rounded-2xl border-white/10 relative z-20">
                <div className="flex items-center gap-3">
                    <span className="bg-white/10 px-4 py-2 rounded-lg font-mono font-bold text-cyan-400 border border-white/5">
                        {currentQuestionIndex + 1} / {totalQuestions}
                    </span>
                </div>
                <div className="flex items-center gap-2 font-bold text-xl text-white">
                    <Trophy className="text-yellow-400" size={24} />
                    <span className="text-yellow-400">{score}</span>
                </div>
            </div>

            {/* Timer Bar */}
            {currentQuestion && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-800 z-30">
                    <motion.div
                        className={`h-full ${timeLeft < 5 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]'}`}
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: currentQuestion.timeLimit, ease: "linear" }}
                    />
                </div>
            )}

            {/* Question Area */}
            {currentQuestion && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-5xl mx-auto w-full relative z-10">

                    <motion.h2
                        key={currentQuestion.text}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-3xl md:text-5xl font-bold text-center text-white mb-16 leading-tight drop-shadow-lg"
                    >
                        {currentQuestion.text}
                    </motion.h2>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        {currentQuestion.options.map((opt, index) => (
                            <motion.button
                                key={opt.id}
                                type="button"
                                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
                                whileTap={{ scale: 0.98 }}
                                onClick={(e) => handleAnswer(e, opt.id)}
                                disabled={selectedOption !== null}
                                className={`bg-gradient-to-br ${getOptionColor(index)} border-2 p-8 rounded-2xl text-white text-left shadow-lg backdrop-blur-sm transition-all relative overflow-hidden group ${selectedOption !== null && selectedOption !== opt.id ? 'opacity-40 grayscale' : ''} ${selectedOption === opt.id ? 'ring-4 ring-white/50 scale-105 z-10' : ''}`}
                            >
                                <div className="absolute top-4 left-4 opacity-30 text-2xl font-black group-hover:opacity-100 transition-opacity">
                                    {getOptionIcon(index)}
                                </div>
                                <span className="text-xl md:text-2xl font-bold block text-center mt-2 group-hover:text-cyan-200 transition-colors">
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
