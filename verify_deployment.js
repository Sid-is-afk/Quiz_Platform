
const https = require('https');

const backendUrl = 'https://quiz-platform-jafc.onrender.com/api/quizzes'; // Using a known route that might 404 but proves connectivity, or 200 if it lists quizzes
const frontendUrl = 'https://quizplatformiit.vercel.app/';

function checkUrl(url, name) {
    return new Promise((resolve, reject) => {
        console.log(`Checking ${name} at ${url}...`);
        https.get(url, (res) => {
            console.log(`${name} Status Code: ${res.statusCode}`);
            if (res.statusCode >= 200 && res.statusCode < 400) {
                console.log(`${name} is UP!`);
                resolve(true);
            } else if (res.statusCode === 404 && name === 'Backend') {
                 // 404 on /api/quizzes might be okay if no quizzes exist or if it's a POST-only endpoint, 
                 // but let's assume connectivity is fine if we get a response.
                 // Actually, let's try the root URL for backend connectivity if this is specific.
                 // But wait, /api/quizzes is a router. GET /api/quizzes/:id is valid. GET /api/quizzes might not be.
                 // Let's just accept that we got a response from the server.
                 console.log(`${name} is reachable (Status ${res.statusCode}).`);
                 resolve(true);
            } else {
                console.error(`${name} might be down or having issues.`);
                resolve(false);
            }
        }).on('error', (e) => {
            console.error(`${name} Error: ${e.message}`);
            resolve(false);
        });
    });
}

async function verify() {
    const backendOk = await checkUrl('https://quiz-platform-jafc.onrender.com', 'Backend Root');
    const frontendOk = await checkUrl(frontendUrl, 'Frontend');

    if (backendOk && frontendOk) {
        console.log('\nDeployment Verification: SUCCESS');
        console.log('Both Backend and Frontend are reachable.');
    } else {
        console.log('\nDeployment Verification: PARTIAL or FAILED');
    }
}

verify();
