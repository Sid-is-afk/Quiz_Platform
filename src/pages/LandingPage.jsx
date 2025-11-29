import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Plus, ArrowRight, Terminal } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [gameCode, setGameCode] = useState('');

    useEffect(() => {
        const code = searchParams.get('code');
        if (code) {
            setGameCode(code);
        }
    }, [searchParams]);

    const handleJoinGame = (e) => {
        e.preventDefault();
        if (gameCode.trim()) {
            navigate('/play', { state: { gameCode } });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 text-center relative z-10">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="mb-16 relative"
            >
                <div className="absolute -inset-1 bg-cyan-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <h1 className="text-7xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-gray-400 mb-6 tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] font-sans">
                    AI QUIZ <span className="text-cyan-400 neon-text">PLATFORM</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto font-light tracking-wide">
                    The next generation of real-time knowledge battles.
                </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl">
                {/* Join Game Card */}
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="glass-card p-10 flex flex-col items-center hover:bg-white/10 transition-colors group"
                >
                    <div className="flex items-center justify-center w-20 h-20 bg-cyan-500/20 rounded-2xl mb-8 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:scale-110 transition-transform duration-300">
                        <Terminal size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-6 tracking-wide">JOIN PROTOCOL</h2>
                    <form onSubmit={handleJoinGame} className="w-full space-y-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="ENTER GAME CODE"
                                value={gameCode}
                                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                                className="glass-input w-full px-6 py-5 text-center text-3xl font-bold tracking-[0.2em] rounded-xl focus:outline-none uppercase placeholder:normal-case placeholder:tracking-normal placeholder:text-gray-600 placeholder:text-lg"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!gameCode}
                            className="btn-primary w-full flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            INITIATE LINK <ArrowRight size={24} />
                        </button>
                    </form>
                </motion.div>

                {/* Create Quiz Card */}
                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="glass-card p-10 flex flex-col items-center justify-between hover:bg-white/10 transition-colors group"
                >
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-20 h-20 bg-purple-600/20 rounded-2xl mb-8 text-purple-400 shadow-[0_0_20px_rgba(147,51,234,0.3)] group-hover:scale-110 transition-transform duration-300">
                            <Plus size={40} />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-6 tracking-wide">CREATE SYSTEM</h2>
                        <p className="text-gray-400 mb-10 text-lg leading-relaxed">
                            Deploy a new quiz instance using advanced AI generation or manual configuration protocols.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/create')}
                        className="btn-secondary w-full flex items-center justify-center gap-3 text-lg"
                    >
                        GENERATE NEW <ArrowRight size={24} />
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default LandingPage;
