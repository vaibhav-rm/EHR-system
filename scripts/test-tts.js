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

async function testTTS() {
    const API_KEY = process.env.ELEVENLABS_API_KEY;
    console.log("Testing ElevenLabs TTS...");
    console.log("API Key present:", !!API_KEY);

    if (!API_KEY) {
        console.error("No API KEY found!");
        return;
    }

    const VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Bella

    try {
        console.log("Sending request...");
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': API_KEY,
            },
            body: JSON.stringify({
                text: "Hello, this is a test.",
                model_id: "eleven_turbo_v2",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                }
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("API Error Status:", response.status);
            console.error("API Error Body:", errorText);
        } else {
            console.log("Success! Audio generated.");
            const buffer = await response.arrayBuffer();
            console.log("Audio size:", buffer.byteLength, "bytes");
        }

    } catch (error) {
        console.error("Request failed:", error.message);
    }
}

testTTS();
