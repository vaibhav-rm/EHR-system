'use server';

import { generateSpeech } from '@/lib/tts';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fhirStore } from '@/lib/fhir-store';

type VoiceResponse = {
    text: string;
    audio: string | null;
    action?: {
        type: 'NAVIGATE' | 'CREATE_CONDITION';
        payload: any;
    };
    debugError?: string;
}

export async function processVoiceCommand(transcript: string): Promise<VoiceResponse> {
    console.log("Processing voice command:", transcript);

    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Debug: API Key present?", !!apiKey);

    if (!apiKey) {
        console.error("GEMINI_API_KEY is missing");
        return {
            text: "I'm sorry, my brain is not connected. Please check configuration.",
            audio: null,
            debugError: "GEMINI_API_KEY environment variable is missing."
        };
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // Fetch Contextual Data (Mocking a logged in patient for now or admin view)
        // In a real app, we would get the session user ID. 
        // For prototype, we'll fetch some aggregate stats to make Dr. Aira smart.
        const allAppointments = await fhirStore.search('Appointment', () => true);
        const allMeds = await fhirStore.search('MedicationRequest', () => true);

        const contextData = {
            totalAppointments: allAppointments.length,
            activeMedications: allMeds.filter((m: any) => m.status === 'active').length,
            recentVitals: {
                heartRate: "72 bpm",
                bp: "120/80",
                lastCheckup: "2 days ago"
            }
        };

        // Using 'gemini-flash-latest' which is confirmed working with your key/quota
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            generationConfig: {
                responseMimeType: "application/json"
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT" as any,
                    threshold: "BLOCK_MEDIUM_AND_ABOVE" as any
                }
            ]
        });

        const prompt = `
            Act as Dr. Aira, a empathetic, highly intelligent, and data-driven medical AI assistant.
            You are speaking to a user of the EHR system.

            CURRENT SYSTEM DATA:
            ${JSON.stringify(contextData, null, 2)}

            USER SAID: "${transcript}"

            YOUR INSTRUCTIONS:
            1. Analyze the user's intent.
            2. If they ask about their health or the system, cite specific numbers from the DATA provided above to give "good insights".
            3. Be friendly, human-like, and professional. Avoid robotic phrases.
            4. Return a JSON object with your response and optional action.

            Possible Actions:
            - NAVIGATE: Payloads:
                - '/dashboard/patient' (Home)
                - '/dashboard/patient/store' (Pharmacy)
                - '/dashboard/patient/labs' (Labs)
                - '/dashboard/patient/settings' (Settings)
                - '/dashboard/doctor' (Doctor View)
            - NONE

            Output Format (JSON ONLY):
            {
                "text": "Natural spoken response (max 2 sentences). Use the numbers!",
                "action": { "type": "NAVIGATE", "payload": "/path" } // OR null
            }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        console.log("Gemini JSON Response:", responseText);

        const parsed = JSON.parse(responseText);

        if (!parsed.text) throw new Error("Invalid Gemini response shape");

        // Generate Audio
        let audio = null;
        try {
            audio = await generateSpeech(parsed.text);
        } catch (ttsError) {
            console.error("TTS Error:", ttsError);
        }

        return {
            text: parsed.text,
            audio,
            action: parsed.action || undefined
        };

    } catch (error: any) {
        console.error("CRITICAL VOICE AGENT ERROR:", error);

        let friendlyMessage = "I'm having trouble connecting to my AI services right now.";
        let debugError = error instanceof Error ? error.message : String(error);

        if (debugError.includes('429') || debugError.includes('Quota exceeded')) {
            friendlyMessage = "I am currently at capacity. Please wait about 30 seconds and try again.";
        }

        return {
            text: friendlyMessage,
            audio: null,
            debugError: debugError
        };
    }
}
