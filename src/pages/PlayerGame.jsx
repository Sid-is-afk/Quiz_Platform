import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { Check, X, Clock } from 'lucide-react';
import { mockQuiz } from '../mockData';

const PlayerGame = () => {
    const navigate = useNavigate();
    const [gameState, setGameState] = useState('waiting'); // waiting, question, feedback, finished
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0);

    const currentQuestion = mockQuiz.questions[currentQuestionIndex];

    // Simulate game start
    useEffect(() => {
        if (gameState === 'waiting') {
            const timer = setTimeout(() => {
                setGameState('question');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [gameState]);

    // Timer logic
    useEffect(() => {
        if (gameState === 'question' && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && gameState === 'question') {
            handleTimeUp();
        }
    }, [gameState, timeLeft]);

    const handleTimeUp = () => {
        // Auto-submit if not selected
        if (!selectedOption) {
            handleAnswer(null);
        }
    };

    const handleAnswer = (optionId) => {
        setSelectedOption(optionId);
        const correct = optionId === currentQuestion.correctAnswer;
        setIsCorrect(correct);
        if (correct) setScore((prev) => prev + 1000); // Simple scoring

        // Show feedback immediately
        setGameState('feedback');

        // Move to next question or finish
        setTimeout(() => {
            if (currentQuestionIndex < mockQuiz.questions.length - 1) {
                setCurrentQuestionIndex((prev) => prev + 1);
                setTimeLeft(30);
                setSelectedOption(null);
                setGameState('question');
            } else {
                setGameState('finished');
                setTimeout(() => navigate('/results'), 2000);
            }
        }, 3000);
    };

    const getOptionColor = (index) => {
        const colors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'];
        return colors[index % 4];
    };

    const getOptionIcon = (index) => {
        const icons = ['▲', '◆', '●', '■'];
        return icons[index % 4];
    };

    if (gameState === 'waiting') {
        return (
            <div className="min-h-screen bg-primary flex flex-col items-center justify-center text-white p-4 text-center">
                <h1 className="text-4xl font-bold mb-8">You're in!</h1>
                <div className="w-24 h-24 relative mb-4">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-white rounded-full opacity-20"
                    />
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl">
                        ...
                    </div>
                </div>
                <p className="text-xl">See your nickname on screen?</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Feedback Overlay */}
            <AnimatePresence>
                {gameState === 'feedback' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${isCorrect ? 'bg-success' : 'bg-red-600'
                            } text-white`}
                    >
                        {isCorrect && <Confetti numberOfPieces={200} recycle={false} />}
                        <motion.div
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            className="text-center"
                        >
                            <div className="text-8xl mb-4">
                                {isCorrect ? <Check size={120} /> : <X size={120} />}
                            </div>
                            <h2 className="text-5xl font-black mb-2">
                                {isCorrect ? 'Correct!' : 'Incorrect'}
                            </h2>
                            <p className="text-2xl font-bold opacity-80">
                                {isCorrect ? '+1000 Points' : 'Better luck next time'}
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex justify-between items-center px-6">
                <div className="flex items-center gap-2 font-bold text-gray-600">
                    <span className="bg-gray-100 px-3 py-1 rounded-lg">
                        {currentQuestionIndex + 1} / {mockQuiz.questions.length}
                    </span>
                </div>
                <div className="font-bold text-xl text-primary">Score: {score}</div>
            </div>

            {/* Question Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full">
                {/* Timer */}
                <div className="mb-8 relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-gray-200"
                        />
                        <motion.circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className={`${timeLeft < 10 ? 'text-red-500' : 'text-primary'}`}
                            initial={{ pathLength: 1 }}
                            animate={{ pathLength: timeLeft / 30 }}
                            transition={{ duration: 1, ease: "linear" }}
                        />
                    </svg>
                    <span className="absolute text-2xl font-bold text-gray-700">{timeLeft}</span>
                </div>

                <h2 className="text-2xl md:text-4xl font-bold text-center text-gray-800 mb-12">
                    {currentQuestion.text}
                </h2>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {currentQuestion.options.map((opt, index) => (
                        <motion.button
                            key={opt.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => gameState === 'question' && handleAnswer(opt.id)}
                            disabled={gameState !== 'question'}
                            className={`${getOptionColor(index)} p-8 rounded-2xl text-white text-left shadow-lg hover:shadow-xl transition-all relative overflow-hidden group`}
                        >
                            <div className="absolute top-4 left-4 opacity-50 text-2xl font-black">
                                {getOptionIcon(index)}
                            </div>
                            <span className="text-xl md:text-2xl font-bold block text-center mt-2">
                                {opt.text}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PlayerGame;
