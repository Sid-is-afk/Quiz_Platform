
require('dotenv').config();
const axios = require('axios');

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("No API Key");
        return;
    }
    try {
        const res = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        console.log("Models:");
        res.data.models.forEach(m => console.log(`- ${m.name}`));
    } catch (e) {
        console.error("List Failed:", e.response ? e.response.data : e.message);
    }
}

listModels();
