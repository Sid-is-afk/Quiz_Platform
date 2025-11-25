import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Plus, ArrowRight } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const [gameCode, setGameCode] = useState('');

    const handleJoinGame = (e) => {
        e.preventDefault();
        if (gameCode.trim()) {
            navigate('/play');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-12"
            >
                <h1 className="text-6xl font-extrabold text-primary mb-4 tracking-tight">
                    AI Quiz <span className="text-accent">Platform</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-lg mx-auto">
                    Create, Host, and Play real-time quizzes powered by AI.
                </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
                {/* Join Game Card */}
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-8 rounded-2xl shadow-xl border-2 border-transparent hover:border-primary/20 transition-all"
                >
                    <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6 mx-auto text-primary">
                        <Play size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Join a Game</h2>
                    <form onSubmit={handleJoinGame} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Enter Game Code"
                            value={gameCode}
                            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                            className="w-full px-6 py-4 text-center text-2xl font-bold tracking-widest border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors uppercase placeholder:normal-case placeholder:tracking-normal placeholder:text-gray-400"
                        />
                        <button
                            type="submit"
                            disabled={!gameCode}
                            className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            Enter Game <ArrowRight size={20} />
                        </button>
                    </form>
                </motion.div>

                {/* Create Quiz Card */}
                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-8 rounded-2xl shadow-xl border-2 border-transparent hover:border-accent/20 transition-all flex flex-col justify-between"
                >
                    <div>
                        <div className="flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-6 mx-auto text-accent">
                            <Plus size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Host a Quiz</h2>
                        <p className="text-gray-600 mb-8">
                            Generate a unique quiz instantly using AI or create your own from scratch.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/create')}
                        className="w-full py-4 bg-accent text-white rounded-xl font-bold text-lg hover:bg-accent/90 transition-all flex items-center justify-center gap-2"
                    >
                        Create Quiz <ArrowRight size={20} />
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default LandingPage;
