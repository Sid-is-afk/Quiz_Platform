import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Check, Edit2, Play } from 'lucide-react';
import { mockQuiz } from '../mockData';

const QuizCreator = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('input'); // input, generating, editor
    const [topic, setTopic] = useState('');
    const [quiz, setQuiz] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const handleGenerate = (e) => {
        e.preventDefault();
        if (!topic.trim()) return;
        setStep('generating');

        // Simulate AI generation
        setTimeout(() => {
            setQuiz({ ...mockQuiz, title: topic });
            setStep('editor');
        }, 2000);
    };

    const handlePublish = () => {
        navigate('/host/lobby');
    };

    return (
        <div className="max-w-4xl mx-auto p-6 min-h-[80vh] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
                {step === 'input' && (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-lg text-center"
                    >
                        <div className="mb-8">
                            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 text-accent">
                                <Sparkles size={40} />
                            </div>
                            <h1 className="text-4xl font-bold text-gray-800 mb-4">What's the topic?</h1>
                            <p className="text-gray-600">
                                Our AI will generate a unique quiz for you in seconds.
                            </p>
                        </div>
                        <form onSubmit={handleGenerate} className="space-y-4">
                            <textarea
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., The History of Rome, 90s Pop Music, Quantum Physics..."
                                className="w-full p-6 text-xl border-2 border-gray-200 rounded-2xl focus:border-accent focus:outline-none transition-colors resize-none h-40"
                            />
                            <button
                                type="submit"
                                disabled={!topic.trim()}
                                className="w-full py-4 bg-accent text-white rounded-xl font-bold text-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                <Sparkles size={20} /> Generate Quiz
                            </button>
                        </form>
                    </motion.div>
                )}

                {step === 'generating' && (
                    <motion.div
                        key="generating"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="text-center"
                    >
                        <div className="relative w-32 h-32 mx-auto mb-8">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="w-full h-full border-4 border-gray-200 border-t-accent rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-accent">
                                <Sparkles size={40} />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Generating Questions...</h2>
                        <p className="text-gray-500">Crafting the perfect quiz for "{topic}"</p>
                    </motion.div>
                )}

                {step === 'editor' && quiz && (
                    <motion.div
                        key="editor"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">{quiz.title}</h1>
                                <p className="text-gray-500">{quiz.questions.length} Questions Generated</p>
                            </div>
                            <button
                                onClick={handlePublish}
                                className="px-8 py-3 bg-success text-white rounded-xl font-bold hover:bg-success/90 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                <Play size={20} /> Publish & Host
                            </button>
                        </div>

                        <div className="space-y-4">
                            {quiz.questions.map((q, index) => (
                                <motion.div
                                    key={q.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`bg-white p-6 rounded-xl border-2 transition-all cursor-pointer ${editingId === q.id ? 'border-primary ring-4 ring-primary/10' : 'border-gray-100 hover:border-gray-200'
                                        }`}
                                    onClick={() => setEditingId(editingId === q.id ? null : q.id)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 flex-shrink-0">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-3">{q.text}</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {q.options.map((opt) => (
                                                    <div
                                                        key={opt.id}
                                                        className={`p-3 rounded-lg text-sm font-medium flex items-center justify-between ${opt.id === q.correctAnswer
                                                                ? 'bg-success/10 text-success border border-success/20'
                                                                : 'bg-gray-50 text-gray-600'
                                                            }`}
                                                    >
                                                        <span>{opt.text}</span>
                                                        {opt.id === q.correctAnswer && <Check size={16} />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-gray-400">
                                            <Edit2 size={18} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuizCreator;
