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

    const userRank = myRank;

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-white overflow-y-auto relative">

            {/* Background Gradient Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-gray-950 to-gray-950 pointer-events-none" />

            {/* Content Container (z-10 to sit above background) */}
            <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8 py-8">

                {/* 1. TITLE SECTION */}
                <div className="text-center space-y-2">
                    <h2 className="text-cyan-400 font-bold tracking-widest text-sm uppercase">Performance Report</h2>
                    <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 leading-tight drop-shadow-lg">
                        MISSION<br />COMPLETE
                    </h1>
                </div>

                {/* 2. SCORE CARD (Glassmorphism) */}
                <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                    <span className="text-gray-400 font-medium tracking-wider text-sm mb-2">TOTAL SCORE</span>

                    {/* Giant Score Number */}
                    <div className="text-7xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] mb-4">
                        {score}
                    </div>

                    {/* Rank Badge */}
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
                        🏆 Rank #{userRank || '-'}
                    </div>
                </div>

                {/* 3. ACTION BUTTONS */}
                <div className="w-full flex flex-col gap-4 mt-2">
                    <button
                        onClick={handleSaveResult}
                        className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:scale-105 transition-transform shadow-lg"
                    >
                        📥 Download Report
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-4 rounded-xl font-bold text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
                    >
                        🏠 Return Home
                    </button>
                </div>

            </div>

            {/* Hidden Report Card for Screenshot - Kept for functionality */}
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
        </div>
    );
};

export default Results;
