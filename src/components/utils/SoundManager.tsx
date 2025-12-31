"use client";

import { useEffect, useRef, useState } from "react";
import SoundToggle from "@/components/ui/SoundToggle";
import { TimeLeft } from "@/hooks/useCountdown";

interface SoundManagerProps {
    isNewYear: boolean;
    timeLeft: TimeLeft;
}

export default function SoundManager({ isNewYear, timeLeft }: SoundManagerProps) {
    const [isMuted, setIsMuted] = useState(true);

    // Refs for audio elements
    const bgmRef = useRef<HTMLAudioElement | null>(null);
    const celebrationRef = useRef<HTMLAudioElement | null>(null);
    const countdownRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initialize Audio
    useEffect(() => {
        bgmRef.current = new Audio("/sounds/bgm.mp3");
        bgmRef.current.loop = true;
        bgmRef.current.volume = 0.5;

        celebrationRef.current = new Audio("/sounds/celebration.mp3");
        celebrationRef.current.volume = 1.0;

        countdownRef.current = new Audio("/sounds/countdown.MP3");
        countdownRef.current.volume = 1.0;

        // Init Web Audio API to unlock audio engine on user interaction
        const initAudioContext = () => {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            if (bgmRef.current?.paused && !isMuted) {
                bgmRef.current.play().catch(e => console.error("Audio play failed", e));
            }
        };

        window.addEventListener('click', initAudioContext, { once: true });
        return () => {
            window.removeEventListener('click', initAudioContext);
            bgmRef.current?.pause();
            celebrationRef.current?.pause();
            countdownRef.current?.pause();
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Handle Mute State
    useEffect(() => {
        if (bgmRef.current) bgmRef.current.muted = isMuted;
        if (celebrationRef.current) celebrationRef.current.muted = isMuted;
        if (countdownRef.current) countdownRef.current.muted = isMuted;

        // Resume BGM if unmuted and was playing or should be playing
        if (!isMuted && bgmRef.current?.paused) {
            bgmRef.current.play().catch(() => { });
        }
    }, [isMuted]);

    // Handle Logic: Countdown & Celebration
    useEffect(() => {
        if (isMuted) return;

        // 1. Celebration
        if (isNewYear) {
            celebrationRef.current?.play().catch(() => { });
        }
        // 2. Countdown Audio (Trigger at exactly 1:00 remaining to compensate for playback delay)
        else if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 1 && timeLeft.seconds === 0) {
            // Trigger at 1:00 (60 seconds) to account for ~1 second audio initialization delay
            countdownRef.current?.play().catch(() => { });
        }
    }, [isNewYear, timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds, isMuted]);

    return (
        <SoundToggle muted={isMuted} onToggle={() => setIsMuted(!isMuted)} />
    );
}
