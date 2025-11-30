"use client";

import { useConversation } from "@elevenlabs/react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useCallback, useState, useRef, useEffect } from "react";
import AIVisualizer from "./AIVisualizer";

export default function VoiceChat() {
    const [isListening, setIsListening] = useState(false);
    const [messages, setMessages] = useState<{ source: 'user' | 'ai'; text: string }[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const conversation = useConversation({
        onConnect: () => {
            console.log("Connected to ElevenLabs Agent");
            setIsListening(true);
        },
        onDisconnect: () => {
            console.log("Disconnected from ElevenLabs Agent");
            setIsListening(false);
        },
        onMessage: (message: any) => {
            console.log("Message:", message);
            // Adjust this based on the actual message structure from ElevenLabs SDK
            // Assuming message might be an object with source and text, or just text
            const text = message.message || message.text || (typeof message === 'string' ? message : JSON.stringify(message));
            const source = message.source === 'user' ? 'user' : 'ai';

            setMessages((prev) => [...prev, { source, text }]);
        },
        onError: (error) => {
            console.error("ElevenLabs Error:", error);
            setIsListening(false);
        },
    });

    const toggleListening = useCallback(async () => {
        if (conversation.status === "connected") {
            await conversation.endSession();
            setIsListening(false);
        } else {
            try {
                await conversation.startSession({
                    agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "",
                    // @ts-ignore
                });
            } catch (error) {
                console.error("Failed to start conversation:", error);
            }
        }
    }, [conversation]);

    const isActive = conversation.status === "connected" && conversation.isSpeaking;

    return (
        <div className="fixed top-4 right-4 w-full max-w-sm z-50 pointer-events-auto flex flex-col gap-4">
            <div className="bg-black/30 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-4 shadow-[0_0_30px_rgba(34,211,238,0.1)]">

                {/* AI Visualizer Area */}
                <div className="flex justify-center mb-4">
                    <AIVisualizer isActive={isActive} />
                </div>

                {/* Status Display */}
                <div className="flex justify-center mb-4">
                    {conversation.status === "connecting" && (
                        <div className="flex items-center gap-2 text-cyan-400 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Connecting...</span>
                        </div>
                    )}
                    {conversation.status === "connected" && (
                        <div className="text-cyan-400 text-sm font-medium">
                            {conversation.isSpeaking ? "Speaking..." : "Listening..."}
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex justify-center">
                    <button
                        onClick={toggleListening}
                        className={`
              relative group flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300
              ${conversation.status === "connected"
                                ? "bg-red-500/20 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                                : "bg-cyan-500/20 border-2 border-cyan-500 hover:bg-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                            }
            `}
                    >
                        {conversation.status === "connected" ? (
                            <MicOff className="w-8 h-8 text-red-400" />
                        ) : (
                            <Mic className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
                        )}

                        {/* Ripple effect when connected */}
                        {conversation.status === "connected" && (
                            <span className="absolute inset-0 rounded-full border border-red-500 animate-ping opacity-75"></span>
                        )}
                    </button>
                </div>
            </div>

            {/* Conversation History */}
            {messages.length > 0 && (
                <div className="bg-black/30 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-4 shadow-[0_0_30px_rgba(34,211,238,0.1)] max-h-60 overflow-y-auto">
                    <div className="flex flex-col gap-2">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.source === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.source === 'user'
                                    ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-500/30'
                                    : 'bg-slate-800/50 text-slate-200 border border-slate-700'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            )}
        </div>
    );
}
