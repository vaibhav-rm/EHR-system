'use server';

import { generateSpeech } from '@/lib/tts';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fhirStore } from '@/lib/fhir-store';
import { auth } from '@/auth';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

type VoiceResponse = {
    text: string;
    audio: string | null;
    action?: {
        type: 'NAVIGATE' | 'CREATE_CONDITION' | 'BOOK_APPOINTMENT';
        payload: any;
    };
    debugError?: string;
}

export async function processVoiceCommand(transcript: string, history: Message[] = []): Promise<VoiceResponse> {
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

        // Get current session for user-specific data
        const session = await auth();
        const userId = session?.user?.id;

        // Get current date and time for context
        const now = new Date();
        const currentDateTime = now.toISOString();
        const formattedDate = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedTime = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        // Fetch user-specific contextual data
        let contextData: any = {
            currentDate: formattedDate,
            currentTime: formattedTime,
            currentISO: currentDateTime,
            userRole: session?.user?.role || 'patient'
        };

        if (userId) {
            // Fetch user's appointments
            const userAppointments = await fhirStore.search('Appointment', (apt: any) =>
                apt.participant?.some((p: any) => p.actor?.reference?.includes(userId))
            );

            // Filter for upcoming appointments
            const upcomingAppointments = userAppointments
                .filter((apt: any) => apt.start && new Date(apt.start) > now)
                .map((apt: any) => ({
                    date: apt.start,
                    status: apt.status,
                    reason: apt.description || apt.serviceType?.[0]?.text || 'General'
                }));

            // Fetch user's medications if patient
            const userMeds = await fhirStore.search('MedicationRequest', (med: any) =>
                med.subject?.reference?.includes(userId)
            );

            contextData = {
                ...contextData,
                upcomingAppointments: upcomingAppointments.slice(0, 5), // Next 5 appointments
                totalAppointments: upcomingAppointments.length,
                activeMedications: userMeds.filter((m: any) => m.status === 'active').length,
                totalMedications: userMeds.length
            };
        } else {
            // Fallback to aggregate data if no session
            const allAppointments = await fhirStore.search('Appointment', () => true);
            const allMeds = await fhirStore.search('MedicationRequest', () => true);

            contextData = {
                ...contextData,
                totalAppointments: allAppointments.length,
                activeMedications: allMeds.filter((m: any) => m.status === 'active').length,
            };
        }

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

        // Build conversation context
        const conversationContext = history.length > 0
            ? `\n\nCONVERSATION HISTORY:\n${history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}\n`
            : '';

        const prompt = `
            Act as Dr. Aira, an empathetic, highly intelligent, and data-driven medical AI assistant.
            You are speaking to a user of the EHR system.

            CRITICAL CONTEXT - CURRENT DATE & TIME:
            Today is: ${contextData.currentDate}
            Current time: ${contextData.currentTime}
            ISO timestamp: ${contextData.currentISO}
            
            IMPORTANT: When user says "tomorrow", "next Monday", etc., calculate the actual date based on TODAY'S date above!

            CURRENT USER DATA:
            ${JSON.stringify(contextData, null, 2)}
            ${conversationContext}
            USER JUST SAID: "${transcript}"

            YOUR CAPABILITIES:
            1. Answer health/system questions using the user's actual data above
            2. Navigate the application  
            3. **BOOK APPOINTMENTS** - Help users schedule medical appointments

            APPOINTMENT BOOKING RULES:
            - When user wants to book an appointment, ask for:
              1. Desired date (calculate from TODAY: ${formattedDate})
                 Examples: "tomorrow" = ${new Date(now.getTime() + 86400000).toISOString().split('T')[0]}
                           "next week" = approximately ${new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0]}
              2. Time preference (morning = 10:00, afternoon = 14:00, evening = 17:00, or specific time)
            - If no doctor specified, DEFAULT to "Dr. Demo"
            - Before creating appointment, ALWAYS confirm with specific date/time: 
              "I'll book an appointment with Dr. Demo on [SPECIFIC DATE like January 23rd] at [TIME like 2:00 PM]. Shall I confirm?"
            - ONLY create appointment when user says "yes", "confirm", "ok", "sure"
            - Check if user already has conflicting appointments at that time
            - If user says NO, ask what they'd like to adjust

            YOUR PERSONALITY:
            - Friendly, conversational, professional
            - Reference their actual data (e.g., "You have ${contextData.totalAppointments} upcoming appointments")
            - Always be time-aware and date-specific

            AVAILABLE ACTIONS:
            - NAVIGATE: { "type": "NAVIGATE", "payload": "/path" }
              Valid paths:
              - "/dashboard" (Patient Home)
              - "/appointments" (View Appointments)
              - "/records" (Medical Records)
              - "/profile" (Settings/Profile)
              - "/doctor" (Doctor Dashboard - if user is a doctor)
              - "/book-appointment" (Book New Appointment)
            - BOOK_APPOINTMENT: { 
                "type": "BOOK_APPOINTMENT", 
                "payload": { 
                    "doctor": "Demo Doctor",
                    "date": "YYYY-MM-DD",  // MUST BE A VALID DATE >= TODAY
                    "time": "HH:MM",       // 24h format
                    "reason": "Consultation"
                } 
              }
              **CRITICAL: ONLY USE BOOK_APPOINTMENT after user confirms! Validate date is not in the past!**

            Output Format (JSON ONLY):
            {
                "text": "Your natural spoken response (max 2 sentences, be specific with dates/times)",
                "action": { "type": "ACTION_TYPE", "payload": {...} } // OR null
            }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        console.log("Gemini JSON Response:", responseText);

        const parsed = JSON.parse(responseText);

        if (!parsed.text) throw new Error("Invalid Gemini response shape");

        // Handle Booking Action
        if (parsed.action?.type === 'BOOK_APPOINTMENT') {
            try {
                const { doctor, date, time, reason } = parsed.action.payload;

                // Get patient ID from session
                const session = await auth();
                if (!session?.user?.id) {
                    return {
                        text: "I need you to be logged in to book appointments. Please sign in first.",
                        audio: null,
                        debugError: "No authenticated session found"
                    };
                }

                // Find Dr. Demo's practitioner ID
                const practitioners = await fhirStore.search('Practitioner', (p: any) =>
                    p.name?.[0]?.family?.toLowerCase().includes('demo') ||
                    p.name?.[0]?.given?.[0]?.toLowerCase().includes('demo')
                );

                const drDemo = practitioners[0];
                if (!drDemo) {
                    return {
                        text: "I couldn't find Dr. Demo in the system. Please try booking manually.",
                        audio: null,
                        debugError: "Dr. Demo practitioner not found"
                    };
                }

                // Validate date is not in the past
                const appointmentDateTime = new Date(`${date}T${time}:00`);
                const nowCheck = new Date();
                if (appointmentDateTime < nowCheck) {
                    return {
                        text: "I can't book appointments in the past. Please choose a future date and time.",
                        audio: null,
                        debugError: `Attempted to book past appointment: ${date} ${time}`
                    };
                }

                // Create appointment with authenticated patient
                const appointment = {
                    resourceType: 'Appointment',
                    status: 'booked', // Changed from 'pending' to 'booked'
                    serviceType: [{
                        text: reason || 'General Consultation',
                        coding: [{ display: 'General Medicine' }] // Add coding for specialty display
                    }],
                    start: `${date}T${time}:00`,
                    participant: [
                        {
                            actor: {
                                reference: `Practitioner/${drDemo.id}`,
                                display: `DD ${drDemo.name?.[0]?.given?.[0] || 'Demo'} ${drDemo.name?.[0]?.family || 'Doctor'}` // Add display name
                            },
                            status: 'accepted'
                        },
                        {
                            actor: { reference: `Patient/${session.user.id}` },
                            status: 'needs-action'
                        }
                    ],
                    description: `${reason || 'Consultation'} - Booked via voice assistant`
                };

                await fhirStore.create(appointment);
                console.log('[Voice] Appointment created:', appointment);

                // Format friendly date for response
                const friendlyDate = new Date(appointmentDateTime).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                });
                const friendlyTime = new Date(appointmentDateTime).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });

                parsed.text = `Perfect! I've booked your appointment with Dr. Demo on ${friendlyDate} at ${friendlyTime}. You can view it in your appointments page.`;
            } catch (bookingError) {
                console.error('[Voice] Booking error:', bookingError);
                return {
                    text: "I had trouble booking the appointment. Please try booking manually or contact support.",
                    audio: null,
                    debugError: bookingError instanceof Error ? bookingError.message : String(bookingError)
                };
            }
        }

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
