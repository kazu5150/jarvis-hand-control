'use client';

import React, { useEffect, useRef } from 'react';

export default function WebcamBackground() {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const startWebcam = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: 1280,
                        height: 720,
                        facingMode: 'user',
                    },
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error('Error accessing webcam:', error);
            }
        };

        startWebcam();
    }, []);

    return (
        <div className="fixed inset-0 -z-10 bg-black">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover opacity-80"
                style={{ transform: 'scaleX(-1)' }} // Mirror the video
            />
            {/* Jarvis-like overlay grid */}
            <div className="absolute inset-0 bg-[url('/grid.png')] opacity-20 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/30 via-transparent to-cyan-900/30 pointer-events-none" />
        </div>
    );
}
