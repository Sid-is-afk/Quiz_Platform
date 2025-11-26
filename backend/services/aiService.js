const { GoogleGenerativeAI } = require("@google/generative-ai");

// Check if API key exists
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing in environment variables.");
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use 'gemini-2.0-flash-lite' as found in available models
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite",
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
    IMPORTANT: Return ONLY the raw JSON string. Do not use Markdown formatting (no \`\`\`json).
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up markdown code blocks if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // Parse the JSON string into an object
    return JSON.parse(text);

  } catch (error) {
    console.error("Error generating quiz with Gemini:", error);
    throw error; // Rethrow original error
  }
};

const generateQuizFromContent = async (content, type, mimeType, questionCount = 5, timeLimit = 20) => {
  let promptParts = [];

  const systemPrompt = `
    You are an expert quiz generator.
    Generate a quiz based on the provided content.
    Number of questions: ${questionCount}
    Time Limit per question: ${timeLimit} seconds

    Output a JSON object with this exact schema:
    {
      "title": "A creative title for the quiz based on the content",
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
    IMPORTANT: Return ONLY the raw JSON string. Do not use Markdown formatting (no \`\`\`json).
  `;

  promptParts.push(systemPrompt);

  if (type === 'text') {
    promptParts.push(`\n\nContent:\n${content}`);
  } else if (type === 'image') {
    promptParts.push({
      inlineData: {
        data: content,
        mimeType: mimeType
      }
    });
  }

  try {
    const result = await model.generateContent(promptParts);
    const response = await result.response;
    let text = response.text();

    // Clean up markdown code blocks if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating quiz from content with Gemini:", error);
    throw error;
  }
};

module.exports = { generateQuiz, generateQuizFromContent };