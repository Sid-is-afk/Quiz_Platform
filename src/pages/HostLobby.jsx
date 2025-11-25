import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Play, Copy, QrCode } from 'lucide-react';

const MOCK_NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Evan', 'Fiona', 'George', 'Hannah'];

const HostLobby = () => {
    const navigate = useNavigate();
    const [players, setPlayers] = useState([]);
    const [gameCode] = useState('GAME-123');

    useEffect(() => {
        const interval = setInterval(() => {
            setPlayers((prev) => {
                if (prev.length >= MOCK_NAMES.length) return prev;
                return [...prev, { id: Date.now(), name: MOCK_NAMES[prev.length] }];
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const handleStartGame = () => {
        // In a real app, this would emit a socket event
        navigate('/leaderboard'); // Or directly to a game view for host, but usually host sees leaderboard/questions
        // For this prototype, let's assume Host View tracks the game state.
        // Actually, the requirements say "Host Lobby" -> "Start Game".
        // Usually Host screen shows the questions too.
        // Let's navigate to a "Host Game View" or just re-use PlayerGame with a host flag?
        // The requirements list "Player Game View" and "Live Leaderboard".
        // Let's send the host to the Leaderboard/Question view.
        // For simplicity, I'll send the host to the Leaderboard which will then "start" the question.
        // Or maybe I should create a separate Host Game View?
        // The requirements don't explicitly ask for a Host Game View, just "Player Game View".
        // But "Live Leaderboard" is a separate route.
        // Let's send Host to /leaderboard which can act as the main screen.
        navigate('/leaderboard');
    };

    return (
        <div className="min-h-screen flex flex-col items-center p-8 bg-primary text-white">
            <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-3xl font-bold">Join at <span className="text-accent">quiz.ai</span></h1>
                    <div className="bg-white/10 px-8 py-4 rounded-2xl backdrop-blur-sm flex items-center gap-4">
                        <span className="text-xl font-medium opacity-80">Game Code:</span>
                        <span className="text-5xl font-black tracking-widest">{gameCode}</span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left: QR & Info */}
                    <div className="md:col-span-1 bg-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center border-2 border-white/10">
                        <div className="w-64 h-64 bg-white rounded-2xl mb-6 flex items-center justify-center text-gray-800">
                            <QrCode size={120} />
                        </div>
                        <p className="text-xl font-medium mb-2">Scan to join</p>
                        <div className="flex items-center gap-2 text-white/60">
                            <Users size={20} />
                            <span>{players.length} waiting</span>
                        </div>
                    </div>

                    {/* Right: Players List */}
                    <div className="md:col-span-2 bg-white rounded-3xl p-8 text-gray-800 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <Users className="text-primary" />
                                Players
                            </h2>
                            <span className="bg-primary/10 text-primary px-4 py-1 rounded-full font-bold">
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
                                        className="bg-gray-50 p-4 rounded-xl font-bold text-center border-2 border-gray-100 shadow-sm animate-pulse-once"
                                    >
                                        {player.name}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {players.length === 0 && (
                                <div className="col-span-full flex flex-col items-center justify-center text-gray-400 py-12">
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
                        className="px-12 py-5 bg-accent text-white rounded-2xl font-bold text-2xl hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-3"
                    >
                        Start Game <Play size={28} fill="currentColor" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper for loading icon
const Loader2 = ({ className, size }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

export default HostLobby;
