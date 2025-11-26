const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
    // Create a dummy text file to simulate a PDF (it will fail at pdf-parse but we check if it reaches that point)
    // Actually, let's create a dummy PDF file if possible, or just test the image path with a dummy base64 text file pretending to be an image?
    // No, multer checks magic numbers? No, usually just extension/mime type from headers.

    // Let's try to upload this script file itself as a "pdf" just to see if it hits the endpoint.
    // It will fail at pdf-parse, which confirms the endpoint is reachable and multer is working.

    const form = new FormData();
    form.append('file', fs.createReadStream(__filename), {
        filename: 'test.pdf',
        contentType: 'application/pdf'
    });
    form.append('amount', 3);
    form.append('timeLimit', 10);

    try {
        console.log('Sending upload request...');
        const response = await axios.post('http://localhost:5000/api/quizzes/generate-from-file', form, {
            headers: {
                ...form.getHeaders()
            }
        });
        console.log('Response:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('Server responded with:', error.response.status, error.response.data);
            // If we get a 500 with "Failed to parse PDF", that means upload worked!
        } else {
            console.error('Error:', error.message);
        }
    }
}

testUpload();
