import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { Trophy, Home, Share2 } from 'lucide-react';

const Results = () => {
    const navigate = useNavigate();
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { state } = useLocation();
    const score = state?.score || 0;

    return (
        <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4 overflow-hidden relative">
            <Confetti width={windowSize.width} height={windowSize.height} numberOfPieces={300} />

            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12 z-10"
            >
                <h1 className="text-5xl md:text-7xl font-black text-white mb-4 drop-shadow-lg">
                    Great Job!
                </h1>
                <p className="text-xl text-white/80">You finished the quiz</p>
            </motion.div>

            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="bg-white rounded-3xl p-12 shadow-2xl mb-12 text-center z-10"
            >
                <div className="text-gray-500 font-bold text-xl mb-2">Your Score</div>
                <div className="text-8xl font-black text-primary mb-4">{score}</div>
                <div className="text-gray-400 font-medium">points</div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="flex gap-4 z-10"
            >
                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-4 bg-white text-primary rounded-xl font-bold text-lg hover:bg-gray-100 transition-all flex items-center gap-2 shadow-lg"
                >
                    <Home size={20} /> Back to Home
                </button>
                <button className="px-8 py-4 bg-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/30 transition-all flex items-center gap-2 backdrop-blur-sm">
                    <Share2 size={20} /> Share Results
                </button>
            </motion.div>
        </div>
    );
};

export default Results;
