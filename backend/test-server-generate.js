const http = require('http');

const data = JSON.stringify({
    topic: 'Science',
    difficulty: 'Easy',
    amount: 3,
    timeLimit: 10
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/quizzes/generate',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Sending request to http://localhost:5000/api/quizzes/generate...');

const req = http.request(options, (res) => {
    console.log(`StatusCode: ${res.statusCode}`);

    let responseBody = '';

    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        console.log('Response:', responseBody);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(data);
req.end();
