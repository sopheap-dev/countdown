import { useState, useEffect } from "react";

export interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

// TEST MODE: Countdown to 9:42 PM today
const now = new Date();
const TARGET_DATE = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 22, 38, 50); // 9:42 PM today
// const TARGET_DATE = new Date("2026-01-01T00:00:00");

export function useCountdown() {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    const [isNewYear, setIsNewYear] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +TARGET_DATE - +new Date();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                setIsNewYear(true);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateTimeLeft(); // Initial call
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, []);

    return { timeLeft, isNewYear };
}
