"use client";

import { motion } from "framer-motion";
import { TimeLeft } from "@/hooks/useCountdown";

interface CountdownDisplayProps {
    timeLeft: TimeLeft;
}

const TimeUnit = ({ value, label }: { value: number; label: string }) => {
    return (
        <div className="flex flex-col items-center justify-center p-2 relative group w-24 md:w-40 lg:w-48">
            {/* Cinematic Floating Text - No Box */}
            <div className="relative z-10 flex flex-col items-center">
                <motion.span
                    key={value}
                    initial={{ scale: 1.1, opacity: 0.8, filter: "blur(2px)" }}
                    animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                    transition={{ type: "tween", ease: "circOut", duration: 0.4 }}
                    style={{
                        // Solid bright gold color
                        color: "#FFD700",
                        textShadow: "0 0 20px rgba(255,215,0,0.8), 3px 3px 8px rgba(0,0,0,0.9), -1px -1px 2px rgba(255,255,150,0.6)",
                        filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.7))"
                    }}
                    className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter font-[family-name:var(--font-orbitron)] tabular-nums skew-x-[-5deg]"
                >
                    {String(value).padStart(2, "0")}
                </motion.span>
                <div className="h-[2px] w-full bg-[#FFD700]/50 mt-2 mb-2 shadow-[0_0_10px_#FFD700]" />
                <span className="text-[0.6rem] md:text-sm uppercase tracking-[0.8em] text-[#FFD700] font-[family-name:var(--font-orbitron)] font-medium drop-shadow-md">
                    {label}
                </span>
            </div>
        </div>
    );
};

const Separator = () => (
    <div className="hidden md:flex flex-col justify-center h-32 md:h-48 lg:h-64 pt-8">
        <div className="w-[1px] h-12 bg-white/20" />
        <div className="w-[1px] h-12 bg-transparent" />
        <div className="w-[1px] h-12 bg-white/20" />
    </div>
);

export default function CountdownDisplay({ timeLeft }: CountdownDisplayProps) {
    return (
        <div className="flex flex-row items-center gap-0 md:gap-4 z-10 relative">
            <TimeUnit value={timeLeft.days} label="DAYS" />
            <Separator />
            <TimeUnit value={timeLeft.hours} label="HRS" />
            <Separator />
            <TimeUnit value={timeLeft.minutes} label="MIN" />
            <Separator />
            <TimeUnit value={timeLeft.seconds} label="SEC" />
        </div>
    );
}
