
require('dotenv').config();
const { generateQuiz } = require('./services/aiService');
const fs = require('fs');

async function debug() {
    console.log('Debugging Gemini API...');
    console.log('API Key Present:', !!process.env.GEMINI_API_KEY);

    try {
        const result = await generateQuiz('Science', 'Easy', 3, 10);
        console.log('Success!');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        const errorLog = `Message: ${error.message}\nStack: ${error.stack}\nResponse: ${error.response ? JSON.stringify(error.response, null, 2) : 'N/A'}`;
        fs.writeFileSync('error.txt', errorLog);
        console.error('Debug Failed! Check error.txt');
    }
}

debug();
