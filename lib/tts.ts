export async function generateSpeech(text: string): Promise<string | null> {
    const API_KEY = process.env.ELEVENLABS_API_KEY;
    const VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Example Voice ID (Bella) - calm and professional

    if (!API_KEY) {
        console.warn("ElevenLabs API Key is missing. TTS will be skipped.");
        return null;
    }

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': API_KEY,
            },
            body: JSON.stringify({
                text,
                model_id: "eleven_monolingual_v1",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                }
            }),
        });

        if (!response.ok) {
            // Fallback or error handling
            const errorText = await response.text();
            console.error("ElevenLabs API Error:", errorText);
            return null;
        }

        const arrayBuffer = await response.arrayBuffer();
        // Convert to base64 for playing in frontend
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        return `data:audio/mpeg;base64,${base64}`;

    } catch (error) {
        console.error("TTS generation failed:", error);
        return null;
    }
}
