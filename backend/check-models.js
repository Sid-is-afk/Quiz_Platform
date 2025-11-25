
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Access the model manager directly if possible, or use a workaround if SDK structure differs.
    // In @google/generative-ai, it's usually via the client or a separate manager.
    // Actually, the SDK doesn't expose ListModels directly in the high-level `getGenerativeModel`.
    // We might need to use the underlying API or just try a different model name.

    // Let's try to just use 'gemini-pro' and see if it works as a quick fix.
    // But to be proper, let's try to hit the REST API to list models if SDK doesn't make it easy.

    // Alternative: Try 'gemini-1.5-flash-001'
    console.log("Trying gemini-1.5-flash-001...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
        const result = await model.generateContent("Hello");
        console.log("gemini-1.5-flash-001 works!");
    } catch (e) {
        console.log("gemini-1.5-flash-001 failed:", e.message);
    }

    console.log("Trying gemini-pro...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log("gemini-pro works!");
    } catch (e) {
        console.log("gemini-pro failed:", e.message);
    }
}

listModels();
