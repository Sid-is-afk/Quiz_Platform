import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Play, Loader2, AlertCircle, Trophy, ArrowRight, Medal, ArrowUp } from 'lucide-react';
import { io } from 'socket.io-client';
import QRCode from 'react-qr-code';
import { API_URL } from '../config';

const HostLobby = () => {
    const navigate = useNavigate();
    const { quizId } = useParams();
    const [players, setPlayers] = useState([]);
    const [roomCode, setRoomCode] = useState(null);
    const [socket, setSocket] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Game State
    const [gameState, setGameState] = useState('LOBBY'); // LOBBY, QUESTION, LEADERBOARD, FINISHED
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);

    useEffect(() => {
        const newSocket = io(API_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
            // Create game immediately upon connection
            newSocket.emit('create_game', { quizId });
        });

        newSocket.on('game_created', ({ roomCode }) => {
            setRoomCode(roomCode);
            setIsLoading(false);
        });

        newSocket.on('player_joined', (updatedPlayers) => {
            setPlayers(updatedPlayers);
        });

        newSocket.on('update_players', (updatedPlayers) => {
            setPlayers(updatedPlayers);
        });

        newSocket.on('game_started', (game) => {
            setGameState('QUESTION');
        });

        newSocket.on('new_question', (data) => {
            setGameState('QUESTION');
            setCurrentQuestion(data.question);
            setCurrentQuestionIndex(data.questionIndex);
            setTotalQuestions(data.totalQuestions);
        });

        newSocket.on('all_answered', () => {
            setGameState('LEADERBOARD');
        });

        newSocket.on('game_over', () => {
            setGameState('FINISHED');
        });

        newSocket.on('error', (err) => {
            setError(err.message);
            setIsLoading(false);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [quizId]);

    const handleStartGame = () => {
        if (socket && roomCode) {
            socket.emit('start_game', roomCode);
        }
    };

    const handleNextQuestion = () => {
        if (socket && roomCode) {
            socket.emit('next_question', roomCode);
        }
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Error Creating Game</h2>
                    <p className="text-red-300 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/create')}
                        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                        Return to Creator
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
                    <p className="text-xl font-medium text-slate-300">Creating Game Room...</p>
                </div>
            </div>
        );
    }

    // --- RENDER STATES ---

    if (gameState === 'LOBBY') {
        const joinUrl = `${window.location.origin}?code=${roomCode}`;
        return (
            <div className="min-h-screen flex flex-col items-center p-8 bg-slate-900 text-white">
                <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-12">
                        <h1 className="text-3xl font-bold">Join at <span className="text-purple-400">quiz.ai</span></h1>
                        <div className="bg-white/10 px-8 py-4 rounded-2xl backdrop-blur-sm flex items-center gap-4 border border-white/10">
                            <span className="text-xl font-medium opacity-80">Game Code:</span>
                            <span className="text-5xl font-black tracking-widest text-purple-400">{roomCode}</span>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Left: QR & Info */}
                        <div className="md:col-span-1 bg-slate-800/50 rounded-3xl p-8 flex flex-col items-center justify-center text-center border border-white/10">
                            <div className="w-64 h-64 bg-white rounded-2xl mb-6 flex items-center justify-center p-4">
                                {roomCode && (
                                    <QRCode
                                        value={joinUrl}
                                        size={220}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        viewBox={`0 0 256 256`}
                                    />
                                )}
                            </div>
                            <p className="text-xl font-medium mb-2">Scan to join</p>
                            <div className="flex items-center gap-2 text-slate-400">
                                <Users size={20} />
                                <span>{players.length} waiting</span>
                            </div>
                        </div>

                        {/* Right: Players List */}
                        <div className="md:col-span-2 bg-slate-800/50 rounded-3xl p-8 border border-white/10 flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold flex items-center gap-3">
                                    <Users className="text-purple-400" />
                                    Players
                                </h2>
                                <span className="bg-purple-500/20 text-purple-300 px-4 py-1 rounded-full font-bold">
                                    {players.length}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-4 content-start">
                                <AnimatePresence>
                                    {players.map((player) => (
                                        <motion.div
                                            key={player.id}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            className="bg-slate-700 p-4 rounded-xl font-bold text-center border border-white/5 shadow-sm"
                                        >
                                            {player.name}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {players.length === 0 && (
                                    <div className="col-span-full flex flex-col items-center justify-center text-slate-500 py-12">
                                        <Loader2 className="animate-spin mb-2" size={32} />
                                        <p>Waiting for players...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer: Start Button */}
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleStartGame}
                            disabled={players.length === 0}
                            className="px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-bold text-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-1 flex items-center gap-3"
                        >
                            Start Game <Play size={28} fill="currentColor" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (gameState === 'QUESTION') {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-white text-center">
                <div className="max-w-4xl w-full">
                    <div className="mb-8 text-slate-400 font-bold text-xl">
                        Question {currentQuestionIndex + 1} of {totalQuestions}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-12 leading-tight">
                        {currentQuestion?.text}
                    </h1>
                    <div className="grid grid-cols-2 gap-6">
                        {currentQuestion?.options.map((opt, i) => (
                            <div key={i} className="bg-slate-800 p-6 rounded-xl text-2xl font-bold border border-white/10 opacity-80">
                                {opt.text}
                            </div>
                        ))}
                    </div>
                    <div className="mt-12">
                        <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-purple-500"
                                initial={{ width: "100%" }}
                                animate={{ width: "0%" }}
                                transition={{ duration: currentQuestion?.timeLimit || 20, ease: "linear" }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (gameState === 'LEADERBOARD') {
        const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
        return (
            <div className="min-h-screen bg-slate-900 p-8 flex flex-col items-center text-white">
                <div className="w-full max-w-4xl">
                    <div className="flex justify-between items-center mb-12">
                        <h1 className="text-4xl font-bold flex items-center gap-4">
                            <Trophy className="text-yellow-400" size={40} />
                            Leaderboard
                        </h1>
                        <button
                            onClick={handleNextQuestion}
                            className="px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-xl transition-all flex items-center gap-2 shadow-lg"
                        >
                            Next Question <ArrowRight size={24} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence>
                            {sortedPlayers.map((player, index) => (
                                <motion.div
                                    layout
                                    key={player.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex items-center p-6 rounded-2xl shadow-lg border-2 ${index === 0 ? 'bg-slate-800 border-yellow-400 scale-105 z-10' : 'bg-slate-800/50 border-transparent'
                                        }`}
                                >
                                    <div className="w-12 flex justify-center text-2xl font-bold">
                                        {index + 1}
                                    </div>
                                    <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center font-bold text-white mx-4">
                                        {player.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold">{player.name}</h3>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-black text-purple-400">{player.score}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        );
    }

    if (gameState === 'FINISHED') {
        const winner = [...players].sort((a, b) => b.score - a.score)[0];
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-8 text-center">
                <Confetti numberOfPieces={500} recycle={false} />
                <h1 className="text-6xl font-black mb-8">Game Over!</h1>
                {winner && (
                    <div className="bg-slate-800 p-12 rounded-3xl border-2 border-yellow-400 shadow-2xl mb-12">
                        <Trophy className="text-yellow-400 w-32 h-32 mx-auto mb-6" />
                        <h2 className="text-4xl font-bold mb-2">Winner</h2>
                        <div className="text-6xl font-black text-purple-400 mb-4">{winner.name}</div>
                        <div className="text-3xl font-bold opacity-80">{winner.score} points</div>
                    </div>
                )}
                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-xl transition-all"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return null;
};

export default HostLobby;
