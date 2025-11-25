import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Clock, HelpCircle, Save, RotateCcw, Play, Loader2 } from 'lucide-react';

const CreateQuiz = () => {
    const navigate = useNavigate();
    const [stage, setStage] = useState('config'); // 'config' | 'preview'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [quizData, setQuizData] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        topic: '',
        difficulty: 'Medium',
        amount: 5,
        timeLimit: 20
    });

    const handleGenerate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/quizzes/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to generate quiz');

            const data = await response.json();
            setQuizData(data);
            setStage('preview');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveAndHost = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Ensure timeLimitPerQuestion is set on the quiz object if not already
            const finalQuizData = {
                ...quizData,
                topic: formData.topic,
                difficulty: formData.difficulty,
                timeLimitPerQuestion: formData.timeLimit
            };

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/quizzes/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalQuizData)
            });

            if (!response.ok) throw new Error('Failed to save quiz');

            const { id } = await response.json();
            navigate(`/host/lobby/${id}`);
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Create New Quiz
                    </h1>
                </div>

                <AnimatePresence mode="wait">
                    {stage === 'config' ? (
                        <motion.div
                            key="config"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-slate-800/50 rounded-2xl p-8 border border-white/10 backdrop-blur-sm"
                        >
                            <form onSubmit={handleGenerate} className="space-y-6">
                                {/* Topic */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Quiz Topic</label>
                                    <div className="relative">
                                        <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                                        <input
                                            type="text"
                                            value={formData.topic}
                                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                            placeholder="e.g., Solar System, 90s Music, JavaScript Basics"
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
                                    {/* Difficulty */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Difficulty</label>
                                        <select
                                            value={formData.difficulty}
                                            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>

                                    {/* Question Count */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Questions: {formData.amount}</label>
                                        <div className="h-[58px] flex items-center bg-slate-900/50 border border-white/10 rounded-xl px-4">
                                            <input
                                                type="range"
                                                min="3"
                                                max="10"
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
                                                className="w-full accent-purple-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Time Limit */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Time per Question</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                                            <select
                                                value={formData.timeLimit}
                                                onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                                            >
                                                <option value="10">10 Seconds</option>
                                                <option value="20">20 Seconds</option>
                                                <option value="30">30 Seconds</option>
                                                <option value="60">60 Seconds</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/20 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Generating Magic...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Generate Quiz with AI
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="space-y-6"
                        >
                            {/* Preview Header */}
                            <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/10 backdrop-blur-sm flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{quizData?.title}</h2>
                                    <p className="text-slate-400 mt-1">
                                        {formData.topic} • {formData.difficulty} • {quizData?.questions?.length} Questions
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setStage('config')}
                                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Regenerate
                                    </button>
                                    <button
                                        onClick={handleSaveAndHost}
                                        disabled={isLoading}
                                        className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-green-500/20 flex items-center gap-2"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                        Publish & Host
                                    </button>
                                </div>
                            </div>

                            {/* Questions List */}
                            <div className="grid gap-4">
                                {quizData?.questions?.map((q, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-slate-800/30 rounded-xl p-6 border border-white/5"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-lg font-medium text-white">
                                                <span className="text-purple-400 mr-2">Q{idx + 1}.</span>
                                                {q.questionText}
                                            </h3>
                                            <span className="text-xs font-mono bg-slate-700 px-2 py-1 rounded text-slate-300">
                                                {q.timeLimit || formData.timeLimit}s
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {q.options.map((opt, optIdx) => (
                                                <div
                                                    key={optIdx}
                                                    className={`p-3 rounded-lg text-sm border ${opt === q.correctAnswer
                                                            ? 'bg-green-500/10 border-green-500/30 text-green-300'
                                                            : 'bg-slate-900/50 border-white/5 text-slate-400'
                                                        }`}
                                                >
                                                    {opt}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CreateQuiz;
