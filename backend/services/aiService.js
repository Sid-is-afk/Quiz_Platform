const { GoogleGenerativeAI } = require("@google/generative-ai");

// Check if API key exists
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing in environment variables.");
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use 'gemini-1.5-flash' for speed and efficiency
// We enforce JSON output using responseMimeType
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

const generateQuiz = async (topic, difficulty, questionCount = 5, timeLimit = 20) => {
  const prompt = `
    You are an expert quiz generator.
    Topic: "${topic}"
    Difficulty: "${difficulty}"
    Number of questions: ${questionCount}
    Time Limit per question: ${timeLimit} seconds

    Output a JSON object with this exact schema:
    {
      "title": "A creative title for the quiz",
      "questions": [
        {
          "questionText": "The question string",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "The exact text of the correct option",
          "correctOptionIndex": 0, 
          "explanation": "A short explanation of why the answer is correct",
          "timeLimit": ${timeLimit}
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON string into an object
    return JSON.parse(text);

  } catch (error) {
    console.error("Error generating quiz with Gemini:", error);
    throw new Error("Failed to generate quiz");
  }
};

module.exports = { generateQuiz };