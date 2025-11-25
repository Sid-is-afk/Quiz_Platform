
const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000/api/quizzes';

async function testIntegration() {
    console.log('--- Starting Integration Test ---');

    // 1. Test Generate
    console.log('\n1. Testing Generate Endpoint...');
    const generatePayload = {
        topic: 'Integration Test',
        difficulty: 'Easy',
        amount: 3,
        timeLimit: 15
    };

    let generatedQuiz = null;
    try {
        const res = await axios.post(`${BACKEND_URL}/generate`, generatePayload);
        generatedQuiz = res.data;
        console.log('✅ Generate Success!');
        console.log('Title:', generatedQuiz.title);
        console.log('Question Count:', generatedQuiz.questions.length);
        console.log('First Question TimeLimit:', generatedQuiz.questions[0].timeLimit);

        if (generatedQuiz.questions[0].timeLimit !== 15) {
            console.warn('⚠️ Warning: TimeLimit mismatch in question object.');
        }
    } catch (err) {
        console.error('❌ Generate Failed:', err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
        if (err.response) console.error('Status:', err.response.status);
        return;
    }

    // 2. Test Save
    console.log('\n2. Testing Save Endpoint...');
    if (!generatedQuiz) return;

    const savePayload = {
        ...generatedQuiz,
        topic: generatePayload.topic,
        difficulty: generatePayload.difficulty,
        timeLimitPerQuestion: generatePayload.timeLimit
    };

    try {
        const res = await axios.post(`${BACKEND_URL}/save`, savePayload);
        console.log('✅ Save Success!');
        console.log('Saved Quiz ID:', res.data.id);
    } catch (err) {
        console.error('❌ Save Failed:', err.response ? err.response.data : err.message);
    }
}

testIntegration();
