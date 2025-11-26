require('dotenv').config();
const { generateQuizFromContent } = require('./services/aiService');

async function test() {
    console.log('Testing generateQuizFromContent with text...');
    const textContent = `
        The solar system has 8 planets.
        Mercury is the closest to the sun.
        Venus is the hottest planet.
        Earth is the only planet with life.
        Mars is known as the red planet.
        Jupiter is the largest planet.
        Saturn has rings.
        Uranus spins on its side.
        Neptune is the furthest planet.
    `;

    try {
        const quiz = await generateQuizFromContent(textContent, 'text', null, 3, 10);
        console.log('Quiz generated successfully!');
        console.log(JSON.stringify(quiz, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
