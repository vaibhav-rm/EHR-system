'use server';

import { generateSpeech } from '@/lib/tts';
// import { GoogleGenerativeAI } from "@google/generative-ai"; 
// In a real scenario, we would import Gemini SDK here

type VoiceResponse = {
    text: string;
    audio: string | null;
    action?: {
        type: 'NAVIGATE' | 'CREATE_CONDITION';
        payload: any;
    };
}

export async function processVoiceCommand(transcript: string): Promise<VoiceResponse> {
    console.log("Processing voice command:", transcript);

    const lower = transcript.toLowerCase();
    let text = "I'm not sure how to help with that.";
    let action: VoiceResponse['action'] = undefined;

    // --- MOCK AI LOGIC (Replace with Gemini for real NLU) ---
    // Gemini Prompt would be: "Classify this text into an intent (NAVIGATE, QUERY, CREATE) and extract entities..."

    if (lower.includes('store') || lower.includes('pharmacy') || lower.includes('buy')) {
        text = "Opening the pharmacy store for you.";
        action = { type: 'NAVIGATE', payload: '/dashboard/patient/store' };
    }
    else if (lower.includes('history') || lower.includes('recent') || lower.includes('condition')) {
        text = "Showing your medical history.";
        action = { type: 'NAVIGATE', payload: '/dashboard/patient' }; // Tabs default to history?
    }
    else if (lower.includes('report') || lower.includes('lab')) {
        text = "Here are your latest lab reports.";
        action = { type: 'NAVIGATE', payload: '/dashboard/patient/labs' };
    }
    else if (lower.includes('settings') || lower.includes('profile')) {
        text = "Opening your settings.";
        action = { type: 'NAVIGATE', payload: '/dashboard/patient/settings' };
    }
    else if (lower.includes('headache') || lower.includes('fever') || lower.includes('pain')) {
        // Basic symptom check intent
        text = "I can add that to your history. Please use the 'Add Record' button on your dashboard to save specific details.";
        // For a fully automated create, we'd extract the entity here.
    }
    else if (lower.includes('hello') || lower.includes('hi')) {
        text = "Hello! I am Dr. Aira. How can I help you today?";
    }

    // --- END MOCK AI ---

    // Generate Audio
    const audio = await generateSpeech(text);

    return {
        text,
        audio,
        action
    };
}
