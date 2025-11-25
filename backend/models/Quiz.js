const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
  },
  questions: [{
    questionText: String,
    options: [String],
    correctAnswer: String,
    correctOptionIndex: Number,
    explanation: String,
    timeLimit: Number,
  }],
  timeLimitPerQuestion: {
    type: Number,
    default: 20
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Quiz', QuizSchema);
