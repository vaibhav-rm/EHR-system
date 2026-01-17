'use client';

import { useState, useEffect, useRef } from 'react';
import { useVoiceAssistant } from '@/hooks/use-voice-assistant';
import { processVoiceCommand } from '@/app/actions/voice';
import { Mic, MicOff, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function VoiceAgent() {
  const router = useRouter();
  const { isListening, transcript, startListening, stopListening, isSupported, setTranscript } = useVoiceAssistant();
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentResponse, setAgentResponse] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Toggle visibility of the chat bubble
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-process when transcript is finalized (browser stops listening)
  useEffect(() => {
    if (!isListening && transcript) {
      handleProcess(transcript);
    }
  }, [isListening, transcript]);

  const handleProcess = async (text: string) => {
    setIsProcessing(true);
    try {
      const response = await processVoiceCommand(text);
      setAgentResponse(response.text);

      // Handle Actions
      if (response.action) {
        if (response.action.type === 'NAVIGATE') {
             toast.info(`Navigating to ${response.action.payload}...`);
             router.push(response.action.payload);
        }
      }

      // Handle Audio
      if (response.audio) {
        if (audioRef.current) {
            audioRef.current.src = response.audio;
            audioRef.current.play();
            setIsPlaying(true);
            audioRef.current.onended = () => setIsPlaying(false);
        }
      } else {
        // Fallback to browser TTS if ElevenLabs fails/missing key
        // const utterance = new SpeechSynthesisUtterance(response.text);
        // window.speechSynthesis.speak(utterance);
      }

    } catch (error) {
      console.error(error);
      setAgentResponse("Sorry, I had trouble understanding that.");
    } finally {
      setIsProcessing(false);
      setTranscript(''); // Reset for next command
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      setAgentResponse(''); // Clear previous response
      setIsOpen(true); // Auto-open when interacting
    }
  };

  if (!isSupported) return null; // Don't render if browser doesn't support API

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <audio ref={audioRef} className="hidden" />
      
      {/* Interaction Bubble */}
      {isOpen && (
        <Card className="w-72 p-4 shadow-2xl border-primary/20 backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 animate-in slide-in-from-bottom-5 fade-in duration-300">
           <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <span>Dr. Aira</span>
                  <button onClick={() => setIsOpen(false)} className="hover:text-primary">✕</button>
              </div>
              
              <div className="min-h-[60px] flex items-center justify-center text-center">
                  {isListening ? (
                    <div className="flex gap-1 items-center">
                        <span className="animate-pulse duration-700 h-2 w-2 rounded-full bg-red-500"></span>
                        <span className="text-sm font-medium italic text-gray-600">Listening...</span>
                    </div>
                  ) : isProcessing ? (
                     <div className="flex gap-2 items-center text-primary">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                     </div>
                  ) : (
                    <p className="text-sm text-gray-800 dark:text-gray-100 font-medium">
                        {agentResponse || "How can I help you?"}
                    </p>
                  )}
              </div>
              {transcript && isListening && (
                  <p className="text-xs text-muted-foreground text-center border-t pt-2 mt-1">"{transcript}"</p>
              )}
           </div>
        </Card>
      )}

      {/* FAB */}
      <Button 
        onClick={toggleListening}
        size="lg"
        className={cn(
            "h-14 w-14 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110",
            isListening ? "bg-red-500 hover:bg-red-600 animate-pulse ring-4 ring-red-200" : 
            isPlaying ? "bg-green-500 hover:bg-green-600 ring-4 ring-green-200" :
            "bg-gradient-to-r from-primary to-teal-500"
        )}
      >
        {isListening ? (
            <MicOff className="h-6 w-6 text-white" /> 
        ): (
            <Mic className="h-6 w-6 text-white" />
        )}
      </Button>
    </div>
  );
}
