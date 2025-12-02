'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Edges, Trail } from '@react-three/drei';
import * as THREE from 'three';

// 3D Component that reacts to hands
function Hologram({ handResultRef }: { handResultRef: React.MutableRefObject<HandLandmarkerResult | null> }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Store the object's current position
    const positionRef = useRef(new THREE.Vector3(0, 0, 0));

    // Prediction State
    const lastHandPosRef = useRef(new THREE.Vector3(0, 0, 0));
    const lastTimeRef = useRef(0);
    const velocityRef = useRef(new THREE.Vector3(0, 0, 0));

    // Visibility State (Scale)
    const scaleRef = useRef(0); // Start invisible
    const targetScaleRef = useRef(0); // Start invisible
    const lastGestureTimeRef = useRef(0);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Basic animation (always rotate slightly)
        meshRef.current.rotation.x += delta * 0.2;
        meshRef.current.rotation.y += delta * 0.1;

        const handResult = handResultRef.current;
        const currentTime = state.clock.getElapsedTime();

        // --- GESTURE DETECTION & SCALE LOGIC ---
        if (handResult && handResult.landmarks.length > 0) {
            const hand = handResult.landmarks[0];
            const wrist = hand[0];

            // Check if hand is OPEN (Palm) or CLOSED (Fist)
            // Simple heuristic: Average distance of finger tips from wrist
            const tips = [hand[4], hand[8], hand[12], hand[16], hand[20]]; // Thumb, Index, Middle, Ring, Pinky
            const pips = [hand[2], hand[6], hand[10], hand[14], hand[18]]; // Knuckles (approx)

            let extendedFingers = 0;
            for (let i = 0; i < 5; i++) {
                const tipDist = Math.sqrt(Math.pow(tips[i].x - wrist.x, 2) + Math.pow(tips[i].y - wrist.y, 2));
                const pipDist = Math.sqrt(Math.pow(pips[i].x - wrist.x, 2) + Math.pow(pips[i].y - wrist.y, 2));
                if (tipDist > pipDist * 1.2) { // Tip is significantly further than knuckle
                    extendedFingers++;
                }
            }

            // Debounce gestures (prevent flickering)
            if (currentTime - lastGestureTimeRef.current > 0.5) {
                if (extendedFingers >= 4) {
                    // OPEN HAND -> SPAWN
                    targetScaleRef.current = 1;
                    lastGestureTimeRef.current = currentTime;
                } else if (extendedFingers <= 1) {
                    // CLOSED FIST -> DESPAWN
                    targetScaleRef.current = 0;
                    lastGestureTimeRef.current = currentTime;
                }
            }
        }

        // Animate Scale
        // Smoothly lerp current scale to target scale
        scaleRef.current += (targetScaleRef.current - scaleRef.current) * delta * 5;
        meshRef.current.scale.setScalar(scaleRef.current);

        // --- HAND TRACKING LOGIC ---
        // Only track if visible (scale > 0.1)
        if (handResult && handResult.landmarks.length > 0 && scaleRef.current > 0.1) {
            const hand = handResult.landmarks[0];
            const thumbTip = hand[4];
            const indexTip = hand[8];

            // 1. Calculate Pinch Distance
            const pinchDistance = Math.sqrt(
                Math.pow(thumbTip.x - indexTip.x, 2) +
                Math.pow(thumbTip.y - indexTip.y, 2)
            );
            const isPinching = pinchDistance < 0.05;

            // 2. Calculate Raw Hand Position
            const midX = (thumbTip.x + indexTip.x) / 2;
            const midY = (thumbTip.y + indexTip.y) / 2;
            const handX = (0.5 - midX) * 10;
            const handY = (0.5 - midY) * 8;
            const rawHandPos = new THREE.Vector3(handX, handY, 0);

            // 3. Calculate Velocity & Prediction
            const dt = currentTime - lastTimeRef.current;
            if (dt > 0 && dt < 0.1) { // Only calculate if valid frame time
                const displacement = rawHandPos.clone().sub(lastHandPosRef.current);
                const currentVelocity = displacement.divideScalar(dt);

                // Smooth velocity to reduce jitter
                velocityRef.current.lerp(currentVelocity, 0.5);
            }

            lastHandPosRef.current.copy(rawHandPos);
            lastTimeRef.current = currentTime;

            // PREDICTION: Extrapolate future position
            // "Look ahead" by ~50ms (0.05s) to compensate for lag
            const PREDICTION_FACTOR = 0.05;
            const predictedPos = rawHandPos.clone().add(velocityRef.current.clone().multiplyScalar(PREDICTION_FACTOR));

            // 4. Interaction Logic
            if (isDragging) {
                if (!isPinching) {
                    setIsDragging(false);
                } else {
                    // Dynamic Lerp: Move faster when hand moves faster
                    const speed = velocityRef.current.length();
                    // Base lerp 0.2, max 0.8. If speed > 5, max out.
                    const dynamicLerp = Math.min(0.8, 0.2 + (speed / 10));

                    positionRef.current.lerp(predictedPos, dynamicLerp);
                }
            } else {
                const distanceToObj = rawHandPos.distanceTo(positionRef.current);
                const GRAB_RADIUS = 1.5;

                if (isPinching && distanceToObj < GRAB_RADIUS) {
                    setIsDragging(true);
                }
            }

            // Apply position
            meshRef.current.position.copy(positionRef.current);

            // Visual Feedback
            if (isDragging) {
                // Grabbing state
                // @ts-ignore
                meshRef.current.material.color.setHex(0xff0055);
                // @ts-ignore
                meshRef.current.material.emissiveIntensity = 2;
                meshRef.current.rotation.x += delta * 10; // Spin faster
                meshRef.current.rotation.y += delta * 10;
            } else {
                // Hover/Idle state
                const distanceToObj = rawHandPos.distanceTo(positionRef.current);
                const isHovering = distanceToObj < 1.5;

                if (isHovering) {
                    // Hover state
                    // @ts-ignore
                    meshRef.current.material.color.setHex(0xffaa00);
                    // @ts-ignore
                    meshRef.current.material.emissiveIntensity = 1.5;
                } else {
                    // Idle state
                    // @ts-ignore
                    meshRef.current.material.color.setHex(0x00ffff);
                    // @ts-ignore
                    meshRef.current.material.emissiveIntensity = 1;
                }
            }

        } else {
            setIsDragging(false);
            // No hand detected or not visible
            // @ts-ignore
            meshRef.current.material.color.setHex(0x0088ff);
            // @ts-ignore
            meshRef.current.material.emissiveIntensity = 0.5;
        }
    });

    return (
        <Float speed={isDragging ? 0 : 2} rotationIntensity={isDragging ? 0 : 0.5} floatIntensity={isDragging ? 0 : 0.5}>
            <group>
                <Trail
                    width={1}
                    length={4}
                    color={isDragging ? "#ff0055" : "#00ffff"}
                    attenuation={(t) => t * t}
                >
                    <mesh ref={meshRef} position={[0, 0, 0]} scale={0}>
                        <icosahedronGeometry args={[1.5, 0]} />
                        <meshStandardMaterial
                            color="#0088ff"
                            emissive="#0044aa"
                            emissiveIntensity={0.5}
                            transparent
                            opacity={0.2}
                            roughness={0}
                            metalness={1}
                        />
                        <Edges
                            scale={1.05}
                            threshold={15}
                            color={isDragging ? "#ff0055" : "#00ffff"}
                        />
                    </mesh>
                </Trail>
            </group>
        </Float>
    );
}

export default function HandControl() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);

    // Optimization: Use ref instead of state for high-frequency updates
    const handResultRef = useRef<HandLandmarkerResult | null>(null);
    // Only use state for UI updates that need to re-render (like "Target Locked" text)
    const [isHandDetected, setIsHandDetected] = useState(false);

    useEffect(() => {
        const initHandLandmarker = async () => {
            const vision = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
            );
            const landmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: '/models/hand_landmarker.task',
                    delegate: 'GPU',
                },
                runningMode: 'VIDEO',
                numHands: 2,
                // @ts-ignore
                minHandDetectionConfidence: 0.5,
                minHandPresenceConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });
            setHandLandmarker(landmarker);
        };

        initHandLandmarker();
    }, []);

    useEffect(() => {
        if (!handLandmarker) return;

        const startWebcam = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720, facingMode: 'user' },
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.addEventListener('loadeddata', predictWebcam);
                }
            } catch (err) {
                console.error(err);
            }
        };

        startWebcam();

        let lastVideoTime = -1;
        let animationFrameId: number;

        const predictWebcam = () => {
            if (videoRef.current && handLandmarker) {
                let startTimeMs = performance.now();
                if (videoRef.current.currentTime !== lastVideoTime) {
                    lastVideoTime = videoRef.current.currentTime;
                    const result = handLandmarker.detectForVideo(videoRef.current, startTimeMs);

                    // Update ref directly - NO RE-RENDER
                    handResultRef.current = result;

                    // Only trigger re-render if detection state changes
                    const hasHand = result.landmarks.length > 0;
                    setIsHandDetected(prev => {
                        if (prev !== hasHand) return hasHand;
                        return prev;
                    });
                }
                animationFrameId = requestAnimationFrame(predictWebcam);
            }
        };

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [handLandmarker]);

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-black">
            {/* Video Background */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 h-full w-full object-cover opacity-50"
                style={{ transform: 'scaleX(-1)' }}
            />

            {/* HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none z-10">
                {/* Top Left Status */}
                <div className="absolute top-10 left-10 p-6 border-l-4 border-cyan-400 bg-black/60 backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                    <div className="text-cyan-400 font-mono text-2xl font-bold tracking-widest animate-pulse">
                        J.A.R.V.I.S.
                    </div>
                    <div className="text-cyan-200 font-mono text-sm mt-2 flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isHandDetected ? 'bg-red-500 animate-ping' : 'bg-cyan-500'}`} />
                        STATUS: {isHandDetected ? 'TARGET LOCKED' : 'SCANNING SECTOR...'}
                    </div>
                </div>

                {/* Bottom Right System Load */}
                <div className="absolute bottom-10 right-10 w-80 border-2 border-cyan-500/50 bg-black/60 backdrop-blur-md rounded-lg p-4 shadow-[0_0_30px_rgba(34,211,238,0.1)]">
                    <div className="text-cyan-400 font-mono text-xs mb-2 flex justify-between">
                        <span>SYSTEM LOAD</span>
                        <span>84%</span>
                    </div>
                    <div className="h-32 w-full grid grid-cols-8 gap-1">
                        {[...Array(32)].map((_, i) => (
                            <div
                                key={i}
                                className={`rounded-sm transition-all duration-500 ${Math.random() > 0.3
                                    ? 'bg-cyan-500/80 shadow-[0_0_5px_rgba(34,211,238,0.5)]'
                                    : 'bg-cyan-900/30'
                                    } ${Math.random() > 0.8 ? 'animate-pulse' : ''}`}
                            />
                        ))}
                    </div>
                    <div className="mt-2 h-1 w-full bg-cyan-900/50 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400 w-[84%] animate-pulse" />
                    </div>
                </div>

                {/* Center Reticle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-cyan-500/20 rounded-full flex items-center justify-center">
                    <div className="w-60 h-60 border border-cyan-500/10 rounded-full animate-spin-slow" />
                    <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                </div>

                {/* Vignette & Scanlines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />
            </div>

            {/* 3D Scene */}
            <div className="absolute inset-0 z-20">
                <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                    <ambientLight intensity={1} />
                    <pointLight position={[10, 10, 10]} intensity={2} />
                    <pointLight position={[-10, -10, -10]} color="#00ffff" intensity={1} />
                    <Hologram handResultRef={handResultRef} />
                </Canvas>
            </div>
        </div>
    );
}
