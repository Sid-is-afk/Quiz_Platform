const express = require('express');
const router = express.Router();
const { generateQuiz } = require('../services/aiService');
const Quiz = require('../models/Quiz');

// POST /api/quizzes/generate
router.post('/generate', async (req, res) => {
    try {
        const { topic, difficulty } = req.body;
        if (!topic || !difficulty) {
            return res.status(400).json({ error: 'Topic and difficulty are required' });
        }
        const quizData = await generateQuiz(topic, difficulty);
        res.json(quizData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate quiz' });
    }
});

// POST /api/quizzes/save
router.post('/save', async (req, res) => {
    try {
        const quiz = new Quiz(req.body);
        const savedQuiz = await quiz.save();
        res.status(201).json({ id: savedQuiz._id });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save quiz' });
    }
});

// GET /api/quizzes/:id
router.get('/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve quiz' });
    }
});

module.exports = router;
