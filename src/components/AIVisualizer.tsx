"use client";

import { motion } from "framer-motion";

interface AIVisualizerProps {
    isActive: boolean;
}

export default function AIVisualizer({ isActive }: AIVisualizerProps) {
    return (
        <div className="flex items-center justify-center gap-1 h-12">
            {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                    key={i}
                    className={`w-1 bg-cyan-400 rounded-full ${isActive ? "opacity-100" : "opacity-30"
                        }`}
                    animate={
                        isActive
                            ? {
                                height: ["10%", "100%", "10%"],
                                backgroundColor: ["#22d3ee", "#a5f3fc", "#22d3ee"],
                            }
                            : {
                                height: "20%",
                            }
                    }
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.1,
                    }}
                />
            ))}
        </div>
    );
}
