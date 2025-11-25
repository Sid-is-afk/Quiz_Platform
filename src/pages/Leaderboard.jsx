import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, ArrowUp, ArrowRight } from 'lucide-react';
import { mockPlayers } from '../mockData';

const Leaderboard = () => {
    const navigate = useNavigate();
    const [players, setPlayers] = useState(mockPlayers);

    // Simulate score updates
    useEffect(() => {
        const interval = setInterval(() => {
            setPlayers((prev) => {
                const newPlayers = prev.map((p) => ({
                    ...p,
                    score: p.score + Math.floor(Math.random() * 200),
                }));
                return newPlayers.sort((a, b) => b.score - a.score);
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const getRankIcon = (index) => {
        if (index === 0) return <Trophy className="text-yellow-400" size={24} />;
        if (index === 1) return <Medal className="text-gray-400" size={24} />;
        if (index === 2) return <Medal className="text-amber-600" size={24} />;
        return <span className="font-bold text-gray-500 w-6 text-center">{index + 1}</span>;
    };

    return (
        <div className="min-h-screen bg-primary p-8 flex flex-col items-center">
            <div className="w-full max-w-4xl">
                <div className="flex justify-between items-center mb-12 text-white">
                    <h1 className="text-4xl font-bold flex items-center gap-4">
                        <Trophy className="text-accent" size={40} />
                        Leaderboard
                    </h1>
                    <button
                        onClick={() => navigate('/play')}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all flex items-center gap-2"
                    >
                        Next Question <ArrowRight size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <AnimatePresence>
                        {players.map((player, index) => (
                            <motion.div
                                layout
                                key={player.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className={`flex items-center p-4 rounded-xl shadow-lg border-2 ${index === 0 ? 'bg-white border-accent scale-105 z-10' : 'bg-white/95 border-transparent'
                                    }`}
                            >
                                <div className="w-12 flex justify-center">
                                    {getRankIcon(index)}
                                </div>
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-primary mx-4">
                                    {player.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-800">{player.name}</h3>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-primary">{player.score}</div>
                                    <div className="text-xs font-bold text-success flex items-center justify-end gap-1">
                                        <ArrowUp size={12} /> {Math.floor(Math.random() * 50) + 10}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
