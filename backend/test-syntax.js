process.env.OPENAI_API_KEY = "sk-test-key";
try {
    console.log("Checking models...");
    require('./models/Quiz');
    console.log("Checking services...");
    require('./services/aiService');
    console.log("Checking routes...");
    require('./routes/quizRoutes');
    console.log("Syntax check passed!");
} catch (error) {
    console.error("Syntax check failed:");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    process.exit(1);
}
