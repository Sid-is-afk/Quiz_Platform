import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Play, Loader2, AlertCircle, Trophy, ArrowRight, Medal, ArrowUp, Copy, Check } from 'lucide-react';
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
    const [copied, setCopied] = useState(false);

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

        newSocket.on('game_over', (data) => {
            console.log('Game Over received', data);
            setGameState('GAME_OVER');
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

    const copyCode = () => {
        if (roomCode) {
            navigator.clipboard.writeText(roomCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="glass-card p-8 text-center max-w-md border-red-500/30">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2 text-white">SYSTEM ERROR</h2>
                    <p className="text-red-300 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/create')}
                        className="btn-secondary w-full"
                    >
                        RETURN TO BASE
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 animate-spin text-cyan-400 mx-auto mb-6" />
                    <p className="text-xl font-bold text-white tracking-widest animate-pulse">INITIALIZING LOBBY...</p>
                </div>
            </div>
        );
    }

    // --- RENDER STATES ---

    if (gameState === 'LOBBY') {
        const joinUrl = `${window.location.origin}?code=${roomCode}`;
        return (
            <div className="min-h-screen flex flex-col items-center p-6 relative z-10">
                <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                        <h1 className="text-4xl font-bold text-white tracking-wide">
                            JOIN AT <span className="text-cyan-400">QUIZ.AI</span>
                        </h1>
                        <div
                            onClick={copyCode}
                            className="glass-card px-10 py-6 flex items-center gap-6 cursor-pointer hover:bg-white/10 transition-colors group relative"
                        >
                            <span className="text-xl font-medium text-gray-400 uppercase tracking-wider">Game Code</span>
                            <span className="text-6xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                                {roomCode}
                            </span>
                            <div className="absolute top-4 right-4 text-gray-500 group-hover:text-white transition-colors">
                                {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* Left: QR & Info */}
                        <div className="md:col-span-4 glass-card p-8 flex flex-col items-center justify-center text-center">
                            <div className="bg-white p-4 rounded-xl mb-8 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                                {roomCode && (
                                    <QRCode
                                        value={joinUrl}
                                        size={250}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        viewBox={`0 0 256 256`}
                                    />
                                )}
                            </div>
                            <p className="text-xl font-bold text-white mb-4 tracking-wide">SCAN TO JOIN</p>
                            <div className="flex items-center gap-3 text-cyan-400 bg-cyan-900/20 px-6 py-2 rounded-full border border-cyan-500/30">
                                <Users size={20} />
                                <span className="font-mono font-bold">{players.length} WAITING</span>
                            </div>
                        </div>

                        {/* Right: Players List */}
                        <div className="md:col-span-8 glass-card p-8 flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                                    <Users className="text-purple-400" />
                                    CONNECTED PLAYERS
                                </h2>
                                <span className="bg-purple-600 text-white px-4 py-1 rounded-full font-bold shadow-[0_0_10px_rgba(147,51,234,0.5)]">
                                    {players.length}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 content-start max-h-[500px] pr-2 custom-scrollbar">
                                <AnimatePresence>
                                    {players.map((player) => (
                                        <motion.div
                                            key={player.id}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            className="bg-white/5 p-4 rounded-xl font-bold text-center border border-white/5 hover:border-cyan-500/50 hover:bg-white/10 transition-all shadow-lg"
                                        >
                                            <div className="truncate text-gray-200">{player.name}</div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {players.length === 0 && (
                                    <div className="col-span-full flex flex-col items-center justify-center text-gray-500 py-20">
                                        <Loader2 className="animate-spin mb-4 text-gray-600" size={40} />
                                        <p className="text-lg font-medium">WAITING FOR PLAYERS...</p>
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
                            className="btn-primary px-12 py-5 text-2xl flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            START GAME <Play size={32} fill="currentColor" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (gameState === 'QUESTION') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 to-purple-900/10 pointer-events-none"></div>
                <div className="max-w-6xl w-full relative z-10">
                    <div className="mb-10 flex justify-center">
                        <span className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full text-cyan-400 font-mono font-bold border border-white/10">
                            QUESTION {currentQuestionIndex + 1} / {totalQuestions}
                        </span>
                    </div>

                    <motion.h1
                        key={currentQuestion?.text}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold mb-16 leading-tight text-white drop-shadow-lg"
                    >
                        {currentQuestion?.text}
                    </motion.h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {currentQuestion?.options.map((opt, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card p-8 rounded-2xl text-2xl font-bold text-gray-300 border-white/5 flex items-center justify-center min-h-[120px]"
                            >
                                {opt.text}
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-16 max-w-4xl mx-auto">
                        <div className="w-full bg-gray-800/50 h-3 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                            <motion.div
                                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 box-shadow-[0_0_10px_rgba(6,182,212,0.5)]"
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
            <div className="min-h-screen p-8 flex flex-col items-center relative z-10">
                <div className="w-full max-w-5xl">
                    <div className="flex justify-between items-center mb-12">
                        <h1 className="text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-sm flex items-center gap-4">
                            <Trophy className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" size={48} />
                            LEADERBOARD
                        </h1>
                        <button
                            onClick={handleNextQuestion}
                            className="btn-primary flex items-center gap-3"
                        >
                            NEXT QUESTION <ArrowRight size={24} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence>
                            {sortedPlayers.map((player, index) => (
                                <motion.div
                                    layout
                                    key={player.id}
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`flex items-center p-6 rounded-2xl border backdrop-blur-md transition-all ${index === 0
                                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)] scale-105 z-10'
                                        : index === 1
                                            ? 'bg-gradient-to-r from-gray-400/20 to-slate-400/20 border-gray-400/50'
                                            : index === 2
                                                ? 'bg-gradient-to-r from-orange-700/20 to-amber-800/20 border-orange-700/50'
                                                : 'bg-white/5 border-white/5'
                                        }`}
                                >
                                    <div className={`w-16 flex justify-center text-3xl font-black ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-orange-400' : 'text-gray-600'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center font-bold text-xl text-white mx-6 border border-white/10">
                                        {player.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`text-2xl font-bold ${index === 0 ? 'text-white' : 'text-gray-200'}`}>{player.name}</h3>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-4xl font-black text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">{player.score}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        );
    }

    if (gameState === 'game_over' || gameState === 'GAME_OVER') {
        const leaderboard = [...players].sort((a, b) => b.score - a.score);
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8 text-white">
                <h1 className="text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    SESSION COMPLETE
                </h1>

                {/* Leaderboard Container - Glass Effect */}
                <div className="w-full max-w-4xl bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-8 shadow-2xl">
                    <h2 className="text-2xl font-semibold mb-6 text-center text-gray-200">Final Leaderboard</h2>

                    {/* Render the Leaderboard List */}
                    <div className="space-y-3">
                        {leaderboard.map((player, index) => (
                            <div key={index} className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5">
                                <div className="flex items-center gap-4">
                                    <span className={`text-xl font-bold ${index === 0 ? 'text-yellow-400' : 'text-gray-400'}`}>#{index + 1}</span>
                                    <span className="text-lg">{player.name}</span>
                                </div>
                                <span className="text-cyan-400 font-mono text-xl">{player.score} pts</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-6">
                    <button
                        onClick={() => navigate('/create')}
                        className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-full font-bold shadow-[0_0_20px_rgba(8,145,178,0.5)] transition-all"
                    >
                        Start New Quiz
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-full font-bold border border-white/10 transition-all"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default HostLobby;
