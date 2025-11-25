import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { Trophy, Home, Share2 } from 'lucide-react';
import { mockPlayers } from '../mockData';

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

    // Sort players by score
    const sortedPlayers = [...mockPlayers].sort((a, b) => b.score - a.score);
    const top3 = sortedPlayers.slice(0, 3);

    return (
        <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4 overflow-hidden relative">
            <Confetti width={windowSize.width} height={windowSize.height} numberOfPieces={300} />

            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12 z-10"
            >
                <h1 className="text-5xl md:text-7xl font-black text-white mb-4 drop-shadow-lg">
                    Game Over!
                </h1>
                <p className="text-xl text-white/80">Here are the champions</p>
            </motion.div>

            <div className="flex items-end justify-center gap-4 md:gap-8 mb-16 z-10 w-full max-w-4xl">
                {/* 2nd Place */}
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="flex flex-col items-center"
                >
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-200 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-3xl font-bold text-gray-600 mb-4 z-20">
                        {top3[1].name.charAt(0)}
                    </div>
                    <div className="w-24 md:w-32 h-40 md:h-64 bg-gray-300 rounded-t-lg shadow-2xl flex flex-col items-center justify-end p-4 relative">
                        <div className="text-4xl font-black text-white/50 mb-2">2</div>
                        <div className="bg-white px-3 py-1 rounded-full text-sm font-bold text-gray-600 mb-2">
                            {top3[1].score}
                        </div>
                        <div className="font-bold text-gray-800 text-lg">{top3[1].name}</div>
                    </div>
                </motion.div>

                {/* 1st Place */}
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, type: "spring" }}
                    className="flex flex-col items-center -mt-12"
                >
                    <div className="relative">
                        <Trophy className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-yellow-300 drop-shadow-lg" size={48} />
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-yellow-400 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-4xl font-bold text-yellow-900 mb-4 z-20">
                            {top3[0].name.charAt(0)}
                        </div>
                    </div>
                    <div className="w-28 md:w-40 h-56 md:h-80 bg-yellow-500 rounded-t-lg shadow-2xl flex flex-col items-center justify-end p-4 relative z-10">
                        <div className="text-5xl font-black text-white/50 mb-2">1</div>
                        <div className="bg-white px-4 py-1 rounded-full text-base font-bold text-yellow-600 mb-2">
                            {top3[0].score}
                        </div>
                        <div className="font-bold text-white text-xl">{top3[0].name}</div>
                    </div>
                </motion.div>

                {/* 3rd Place */}
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, type: "spring" }}
                    className="flex flex-col items-center"
                >
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-amber-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-3xl font-bold text-white mb-4 z-20">
                        {top3[2].name.charAt(0)}
                    </div>
                    <div className="w-24 md:w-32 h-32 md:h-48 bg-amber-700 rounded-t-lg shadow-2xl flex flex-col items-center justify-end p-4 relative">
                        <div className="text-4xl font-black text-white/50 mb-2">3</div>
                        <div className="bg-white px-3 py-1 rounded-full text-sm font-bold text-amber-800 mb-2">
                            {top3[2].score}
                        </div>
                        <div className="font-bold text-white text-lg">{top3[2].name}</div>
                    </div>
                </motion.div>
            </div>

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
