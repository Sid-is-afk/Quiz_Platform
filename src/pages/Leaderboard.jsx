import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, ArrowUp, ArrowRight, Home } from 'lucide-react';
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
        if (index === 0) return <Trophy className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" size={28} />;
        if (index === 1) return <Medal className="text-gray-300 drop-shadow-[0_0_10px_rgba(209,213,219,0.5)]" size={28} />;
        if (index === 2) return <Medal className="text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.5)]" size={28} />;
        return <span className="font-bold text-gray-500 w-6 text-center">{index + 1}</span>;
    };

    return (
        <div className="min-h-screen p-8 flex flex-col items-center relative z-10">
            <div className="w-full max-w-4xl">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-5xl font-black flex items-center gap-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-sm">
                        <Trophy className="text-yellow-400" size={48} />
                        LEADERBOARD
                    </h1>
                    <button
                        onClick={() => navigate('/')}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <Home size={20} /> HOME
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
                                className={`flex items-center p-6 rounded-2xl border backdrop-blur-md transition-all ${index === 0
                                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)] scale-105 z-10'
                                        : index === 1
                                            ? 'bg-gradient-to-r from-gray-400/20 to-slate-400/20 border-gray-400/50'
                                            : index === 2
                                                ? 'bg-gradient-to-r from-orange-700/20 to-amber-800/20 border-orange-700/50'
                                                : 'bg-white/5 border-white/5'
                                    }`}
                            >
                                <div className="w-16 flex justify-center">
                                    {getRankIcon(index)}
                                </div>
                                <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center font-bold text-xl text-white mx-4 border border-white/10">
                                    {player.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h3 className={`text-2xl font-bold ${index === 0 ? 'text-white' : 'text-gray-200'}`}>{player.name}</h3>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">{player.score}</div>
                                    <div className="text-sm font-bold text-green-400 flex items-center justify-end gap-1">
                                        <ArrowUp size={14} /> {Math.floor(Math.random() * 50) + 10}
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
