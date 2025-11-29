import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Clock, HelpCircle, Save, RotateCcw, Play, Loader2, Upload, FileText, Image as ImageIcon, Check } from 'lucide-react';

import { API_URL } from '../config';

const CreateQuiz = () => {
    const navigate = useNavigate();
    const [stage, setStage] = useState('config'); // 'config' | 'preview'
    const [mode, setMode] = useState('topic'); // 'topic' | 'file'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [quizData, setQuizData] = useState(null);
    const [file, setFile] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        topic: '',
        difficulty: 'Medium',
        amount: 5,
        timeLimit: 20
    });

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);
        setError(null);

        try {
            let response;

            if (mode === 'topic') {
                response = await fetch(`${API_URL}/api/quizzes/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            } else {
                if (!file) {
                    throw new Error("Please upload a file");
                }

                const data = new FormData();
                data.append('file', file);
                data.append('amount', formData.amount);
                data.append('timeLimit', formData.timeLimit);

                response = await fetch(`${API_URL}/api/quizzes/generate-from-file`, {
                    method: 'POST',
                    body: data
                });
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || 'Failed to generate quiz');
            }

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
                topic: mode === 'topic' ? formData.topic : (file ? file.name : 'Uploaded Content'),
                difficulty: formData.difficulty,
                timeLimitPerQuestion: formData.timeLimit
            };

            const response = await fetch(`${API_URL}/api/quizzes/save`, {
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

    const difficulties = ['Easy', 'Medium', 'Hard'];

    return (
        <div className="min-h-screen p-6 relative z-10">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="p-3 hover:bg-white/10 rounded-full transition-colors text-cyan-400"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-wide drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                        CREATE NEW QUIZ
                    </h1>
                </div>

                <AnimatePresence mode="wait">
                    {stage === 'config' ? (
                        <motion.div
                            key="config"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass-card p-8 md:p-10"
                        >
                            {/* Mode Toggle */}
                            <div className="flex p-1 bg-black/40 rounded-xl mb-8 w-fit border border-white/5">
                                <button
                                    onClick={() => setMode('topic')}
                                    className={`px-6 py-3 rounded-lg text-sm font-bold tracking-wide transition-all ${mode === 'topic'
                                        ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    BY TOPIC
                                </button>
                                <button
                                    onClick={() => setMode('file')}
                                    className={`px-6 py-3 rounded-lg text-sm font-bold tracking-wide transition-all ${mode === 'file'
                                        ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    UPLOAD FILE
                                </button>
                            </div>

                            <form onSubmit={handleGenerate} className="space-y-8">
                                {mode === 'topic' ? (
                                    /* Topic Input */
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-cyan-400 tracking-wider uppercase">Quiz Topic</label>
                                        <div className="relative group">
                                            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 group-focus-within:text-cyan-400 transition-colors" />
                                            <input
                                                type="text"
                                                value={formData.topic}
                                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                                placeholder="e.g., QUANTUM PHYSICS, 80s SYNTHWAVE"
                                                className="glass-input w-full py-4 pl-12 pr-4 rounded-xl"
                                                required={mode === 'topic'}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    /* File Upload */
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-purple-400 tracking-wider uppercase">Upload Content</label>
                                        <div className="relative border-2 border-dashed border-gray-700 rounded-xl p-10 text-center hover:border-purple-500 hover:bg-purple-500/5 transition-all group cursor-pointer">
                                            <input
                                                type="file"
                                                accept=".pdf,image/*"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                required={mode === 'file'}
                                            />
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="p-5 bg-gray-800/50 rounded-full group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(147,51,234,0.2)]">
                                                    {file ? (
                                                        file.type.includes('pdf') ? <FileText className="w-10 h-10 text-cyan-400" /> : <ImageIcon className="w-10 h-10 text-purple-400" />
                                                    ) : (
                                                        <Upload className="w-10 h-10 text-gray-400 group-hover:text-purple-400 transition-colors" />
                                                    )}
                                                </div>
                                                <div className="text-gray-400">
                                                    {file ? (
                                                        <span className="text-white font-bold text-lg">{file.name}</span>
                                                    ) : (
                                                        <>
                                                            <span className="text-purple-400 font-bold">CLICK TO UPLOAD</span> OR DRAG AND DROP
                                                            <p className="text-xs mt-2 text-gray-500 uppercase tracking-wide">PDF OR IMAGES SUPPORTED</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Difficulty - Custom Chips */
                                        mode === 'topic' && (
                                            <div className="space-y-3">
                                                <label className="text-sm font-bold text-cyan-400 tracking-wider uppercase">Difficulty</label>
                                                <div className="flex gap-3">
                                                    {difficulties.map((diff) => (
                                                        <button
                                                            key={diff}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, difficulty: diff })}
                                                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border ${formData.difficulty === diff
                                                                ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                                                                : 'bg-black/20 border-white/10 text-gray-500 hover:border-white/30'
                                                                }`}
                                                        >
                                                            {diff.toUpperCase()}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    }

                                    {/* Question Count */
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-cyan-400 tracking-wider uppercase">Questions: <span className="text-white">{formData.amount}</span></label>
                                            <div className="h-[52px] flex items-center bg-black/20 border border-white/10 rounded-xl px-4">
                                                <input
                                                    type="range"
                                                    min="3"
                                                    max="10"
                                                    value={formData.amount}
                                                    onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
                                                    className="w-full accent-cyan-500 cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    }
                                </div>

                                {/* Time Limit */}
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-cyan-400 tracking-wider uppercase">Time per question (seconds)</label>
                                    <div className="relative group">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 group-focus-within:text-cyan-400 transition-colors" />
                                        <input
                                            type="number"
                                            min="5"
                                            max="600"
                                            value={formData.timeLimit}
                                            onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 0 })}
                                            className="glass-input w-full py-4 pl-12 pr-4 rounded-xl"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn-primary w-full flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            INITIALIZING AI CORE...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-6 h-6" />
                                            GENERATE QUIZ
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
                            <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white tracking-wide">{quizData?.title}</h2>
                                    <p className="text-cyan-400 mt-1 font-mono text-sm">
                                        {mode === 'topic' ? formData.topic.toUpperCase() : 'UPLOADED CONTENT'} • {formData.difficulty.toUpperCase()} • {quizData?.questions?.length} Qs
                                    </p>
                                </div>
                                <div className="flex gap-4 w-full md:w-auto">
                                    <button
                                        onClick={() => setStage('config')}
                                        className="flex-1 md:flex-none px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 text-gray-300"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        RETRY
                                    </button>
                                    <button
                                        onClick={handleSaveAndHost}
                                        disabled={isLoading}
                                        className="flex-1 md:flex-none btn-secondary flex items-center justify-center gap-2 text-sm"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                        LAUNCH SYSTEM
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
                                        className="bg-white/5 rounded-xl p-6 border border-white/5 hover:border-cyan-500/30 transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-lg font-medium text-white">
                                                <span className="text-cyan-400 mr-3 font-bold">0{idx + 1}</span>
                                                {q.questionText}
                                            </h3>
                                            <span className="text-xs font-mono bg-cyan-900/30 text-cyan-400 px-3 py-1 rounded border border-cyan-500/30">
                                                {q.timeLimit || formData.timeLimit}s
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {q.options.map((opt, optIdx) => (
                                                <div
                                                    key={optIdx}
                                                    className={`p-4 rounded-lg text-sm border font-medium flex items-center justify-between ${opt === q.correctAnswer
                                                        ? 'bg-green-500/20 border-green-500/50 text-green-300 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                                                        : 'bg-black/20 border-white/5 text-gray-400'
                                                        }`}
                                                >
                                                    {opt}
                                                    {opt === q.correctAnswer && <Check className="w-4 h-4 text-green-400" />}
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
