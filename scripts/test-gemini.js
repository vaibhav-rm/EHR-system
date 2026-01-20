const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Manually load .env.local
try {
    const envPath = path.join(__dirname, '../.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^"|"$/g, '');
            process.env[key] = value;
        }
    });
} catch (e) {
    console.warn("Could not load .env.local", e.message);
}

async function testModel() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API key found");
        return;
    }
    console.log("Using API Key:", apiKey.substring(0, 5) + "...");

    try {
        console.log("Testing gemini-flash-latest...");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent("Hello, strictly return 'OK'.");
        console.log("Success! Response:", result.response.text());
    } catch (e) {
        console.error("Failed with gemini-flash-latest:", e.message);
    }
}

testModel();
