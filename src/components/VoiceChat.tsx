"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import AIVisualizer from "./AIVisualizer";

// Add type definition for Web Speech API
declare global {
    interface Window {
        webkitSpeechRecognition: any;
    }
}

export default function VoiceChat() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined" && window.webkitSpeechRecognition) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = "ja-JP"; // Set to Japanese as requested

            recognition.onstart = () => {
                setIsListening(true);
                setTranscript("");
            };

            recognition.onresult = (event: any) => {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript;
                setTranscript(transcriptText);
            };

            recognition.onend = () => {
                setIsListening(false);
                // If we have a transcript, send it to AI
                if (recognitionRef.current && recognitionRef.current.lastTranscript) {
                    handleSendMessage(recognitionRef.current.lastTranscript);
                }
            };

            recognitionRef.current = recognition;
        }
    }, []);

    // Helper to store last transcript because onend doesn't receive the event
    useEffect(() => {
        if (recognitionRef.current) {
            recognitionRef.current.lastTranscript = transcript;
        }
    }, [transcript]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setAiResponse(""); // Clear previous response
            recognitionRef.current?.start();
        }
    };

    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: text }),
            });

            const data = await response.json();
            if (data.response) {
                setAiResponse(data.response);
            } else if (data.error) {
                console.error("AI Error:", data.error);
                setAiResponse(`Error: ${data.error} ${data.details ? `(${data.details})` : ''}`);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setAiResponse("Error: Failed to connect to server");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed top-4 right-4 w-full max-w-sm z-50 pointer-events-auto">
            <div className="bg-black/30 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-4 shadow-[0_0_30px_rgba(34,211,238,0.1)]">

                {/* AI Visualizer Area */}
                <div className="flex justify-center mb-4">
                    <AIVisualizer isActive={isListening || isLoading} />
                </div>

                {/* Chat Display */}
                <div className="space-y-4 mb-6 min-h-[100px] max-h-[300px] overflow-y-auto custom-scrollbar">
                    {transcript && (
                        <div className="flex justify-end">
                            <div className="bg-cyan-900/40 border border-cyan-500/30 rounded-2xl rounded-tr-none px-4 py-2 text-cyan-100 max-w-[80%]">
                                <p className="text-sm font-medium text-cyan-400 mb-1">YOU</p>
                                <p>{transcript}</p>
                            </div>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl rounded-tl-none px-4 py-2 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                                <span className="text-cyan-400 text-sm">Processing...</span>
                            </div>
                        </div>
                    )}

                    {aiResponse && !isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-900/80 border border-cyan-500/50 rounded-2xl rounded-tl-none px-4 py-2 text-white max-w-[90%] shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                                <p className="text-sm font-medium text-cyan-400 mb-1">JARVIS</p>
                                <p className="leading-relaxed">{aiResponse}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex justify-center">
                    <button
                        onClick={toggleListening}
                        className={`
              relative group flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300
              ${isListening
                                ? "bg-red-500/20 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                                : "bg-cyan-500/20 border-2 border-cyan-500 hover:bg-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                            }
            `}
                    >
                        {isListening ? (
                            <MicOff className="w-8 h-8 text-red-400" />
                        ) : (
                            <Mic className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
                        )}

                        {/* Ripple effect when listening */}
                        {isListening && (
                            <span className="absolute inset-0 rounded-full border border-red-500 animate-ping opacity-75"></span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
