const express = require('express');
const router = express.Router();
const { generateQuiz, generateQuizFromContent } = require('../services/aiService');
const Quiz = require('../models/Quiz');
const multer = require('multer');
const pdf = require('pdf-parse');

// Configure Multer
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// POST /api/quizzes/generate-from-file
router.post('/generate-from-file', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { amount, timeLimit } = req.body;
        const fileBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        let content;
        let type;

        if (mimeType === 'application/pdf') {
            const pdfData = await pdf(fileBuffer);
            content = pdfData.text;
            type = 'text';
        } else if (mimeType.startsWith('image/')) {
            content = fileBuffer.toString('base64');
            type = 'image';
        } else {
            return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF or an image.' });
        }

        const quizData = await generateQuizFromContent(content, type, mimeType, amount, timeLimit);
        res.json(quizData);

    } catch (error) {
        console.error('File quiz generation error:', error);
        res.status(500).json({ error: 'Failed to generate quiz from file', details: error.message });
    }
});

// POST /api/quizzes/generate
router.post('/generate', async (req, res) => {
    try {
        const { topic, difficulty, amount, timeLimit } = req.body;
        if (!topic || !difficulty) {
            return res.status(400).json({ error: 'Topic and difficulty are required' });
        }
        const quizData = await generateQuiz(topic, difficulty, amount, timeLimit);
        res.json(quizData);
    } catch (error) {
        console.error('Quiz generation error:', error);
        res.status(500).json({ error: 'Failed to generate quiz', details: error.message });
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
