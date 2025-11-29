import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { Trophy, Home, Share2, Check, X, Medal, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

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
    const userAnswers = state?.userAnswers || [];
    const playerName = state?.playerName || 'Player';
    const leaderboard = state?.leaderboard || [];

    // Sort leaderboard to find rank
    const sortedLeaderboard = [...leaderboard].sort((a, b) => b.score - a.score);
    const myRank = sortedLeaderboard.findIndex(p => p.name === playerName) + 1;

    const handleSaveResult = async () => {
        const element = document.getElementById('quiz-report-card');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#0a0a0a', // Dark background
                useCORS: true
            });

            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `${playerName}-quiz-result.png`;
            link.click();
        } catch (err) {
            console.error('Failed to save image:', err);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <Confetti width={windowSize.width} height={windowSize.height} numberOfPieces={300} recycle={false} />

            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12 z-10"
            >
                <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                    MISSION COMPLETE
                </h1>
                <p className="text-xl text-gray-300 tracking-widest uppercase">Performance Report Generated</p>
            </motion.div>

            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="glass-card p-12 mb-12 text-center z-10 relative group"
            >
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative">
                    <div className="text-cyan-400 font-bold text-xl mb-2 tracking-widest uppercase">Total Score</div>
                    <div className="text-8xl font-black text-white mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{score}</div>

                    {myRank > 0 && (
                        <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                            <Trophy size={16} className="text-yellow-400" />
                            <span className="text-white font-bold">RANK #{myRank}</span>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Hidden Report Card for Screenshot */}
            <div id="quiz-report-card" className="fixed top-0 left-0 -z-50 bg-gray-950 p-12 w-[800px] text-white border-4 border-cyan-500/30">
                <div className="text-center mb-10 border-b border-white/10 pb-8">
                    <h1 className="text-5xl font-black text-cyan-400 mb-4 tracking-wider">QUIZ REPORT</h1>
                    <h2 className="text-3xl font-bold text-white">{playerName}</h2>
                    <div className="mt-4 text-6xl font-black text-purple-400">{score} PTS</div>
                </div>
                <div className="space-y-6">
                    {userAnswers.slice(0, 5).map((ans, i) => (
                        <div key={i} className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <p className="font-bold text-xl mb-2 text-gray-200">{i + 1}. {ans.questionText}</p>
                            <div className="flex justify-between items-center">
                                <span className={`font-bold text-lg ${ans.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                    {ans.selectedOptionText}
                                </span>
                                {ans.isCorrect ? (
                                    <Check className="text-green-400" size={28} />
                                ) : (
                                    <X className="text-red-400" size={28} />
                                )}
                            </div>
                        </div>
                    ))}
                    {userAnswers.length > 5 && (
                        <p className="text-center text-gray-500 italic">...and {userAnswers.length - 5} more questions</p>
                    )}
                </div>
                <div className="mt-12 text-center text-gray-500 font-mono text-sm">
                    GENERATED BY AI QUIZ PLATFORM
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex flex-col md:flex-row gap-6 z-10"
            >
                <button
                    onClick={() => navigate('/')}
                    className="btn-secondary flex items-center justify-center gap-3"
                >
                    <Home size={20} /> RETURN HOME
                </button>
                <button
                    onClick={handleSaveResult}
                    className="btn-primary flex items-center justify-center gap-3"
                >
                    <Download size={20} /> SAVE REPORT
                </button>
            </motion.div>
        </div>
    );
};

export default Results;
