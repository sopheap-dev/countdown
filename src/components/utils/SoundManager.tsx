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
    const celebrationRef = useRef<HTMLAudioElement | null>(null); // Keeping as fallback or unused
    const countdownRef = useRef<HTMLAudioElement | null>(null);
    const songRef = useRef<HTMLAudioElement | null>(null); // New song.MP3
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initialize Audio
    useEffect(() => {
        bgmRef.current = new Audio("/sounds/bgm.mp3");
        bgmRef.current.loop = true;
        bgmRef.current.volume = 0.5;

        // celebrationRef.current = new Audio("/sounds/celebration.mp3"); // Optional now

        songRef.current = new Audio("/sounds/song.MP3");
        songRef.current.volume = 1.0;
        songRef.current.loop = true; // Assume celebration song loops? Or play once? Let's loop for ambience.

        countdownRef.current = new Audio("/sounds/countdown.MP3");
        countdownRef.current.volume = 1.0;

        // CHAINING: When countdown finishes, play song.MP3
        countdownRef.current.onended = () => {
            console.log("Countdown finished, playing song.MP3");
            songRef.current?.play().catch(e => console.error("Song play failed", e));
        };

        // Init Web Audio API to unlock audio engine on user interaction
        const initAudioContext = () => {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            if (bgmRef.current?.paused && !isMuted && !isNewYear && !countdownRef.current?.paused === false) {
                // Play BGM only if nothing else is playing
                bgmRef.current.play().catch(e => console.error("Audio play failed", e));
            }
        };

        window.addEventListener('click', initAudioContext, { once: true });
        return () => {
            window.removeEventListener('click', initAudioContext);
            bgmRef.current?.pause();
            celebrationRef.current?.pause();
            countdownRef.current?.pause();
            songRef.current?.pause();
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Handle Mute State
    useEffect(() => {
        if (bgmRef.current) bgmRef.current.muted = isMuted;
        if (songRef.current) songRef.current.muted = isMuted;
        if (countdownRef.current) countdownRef.current.muted = isMuted;

        // Resume audio if unmuted
        if (!isMuted) {
            if (isNewYear) {
                // specific logic handled in main effect
            } else if (bgmRef.current?.paused && countdownRef.current?.paused) {
                bgmRef.current.play().catch(() => { });
            }
        }
    }, [isMuted, isNewYear]);

    // Handle Logic: Countdown & Celebration
    useEffect(() => {
        if (isMuted) return;

        // 1. Celebration (New Year)
        if (isNewYear) {
            bgmRef.current?.pause(); // Stop BGM

            // Check if countdown is currently playing (transitioning)
            if (countdownRef.current && !countdownRef.current.paused) {
                // Do nothing, let countdown finish and trigger onended -> song.MP3
                return;
            }

            // If countdown is NOT playing (e.g. refresh after New Year), play song.MP3 directly
            if (songRef.current?.paused) {
                console.log("New Year state detected, playing song.MP3 directly");
                songRef.current.play().catch(() => { });
            }
        }
        // 2. Countdown Audio (Trigger at exactly 1:00 remaining)
        else if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 1 && timeLeft.seconds === 0) {
            // Stop BGM for countdown
            bgmRef.current?.pause();

            // Trigger at 1:00 (60 seconds)
            countdownRef.current?.play().catch(() => { });
        }
    }, [isNewYear, timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds, isMuted]);

    return (
        <SoundToggle muted={isMuted} onToggle={() => setIsMuted(!isMuted)} />
    );
}
