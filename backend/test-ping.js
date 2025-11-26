const axios = require('axios');

async function testPing() {
    try {
        console.log('Pinging...');
        const response = await axios.get('http://localhost:5000/api/quizzes/ping');
        console.log('Response:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('Server Error:', error.response.status, error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testPing();
