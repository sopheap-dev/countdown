"use client";

import dynamic from "next/dynamic";
import { useCountdown } from "@/hooks/useCountdown";
import CountdownDisplay from "@/components/ui/CountdownDisplay";
import TributeMessage from "@/components/ui/TributeMessage";
import SoundManager from "@/components/utils/SoundManager";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Dynamic import for 3D scene to avoid SSR issues
const Scene = dynamic(() => import("@/components/canvas/Scene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-black" />,
});



export default function Home() {
  const { timeLeft, isNewYear } = useCountdown();

  return (
    <main className="relative w-screen h-screen overflow-hidden flex flex-col items-center justify-end pb-4 md:pb-8">
      <SoundManager isNewYear={isNewYear} timeLeft={timeLeft} />

      {/* Background Image */}
      <div
        className="absolute inset-0 z-[-1] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/images/newyear_bg.jpg")' }}
      >
        {/* Overlay to ensure text readability if needed, though we want particles to shine */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* 3D Background (Transparent Overlay) */}
      <Scene isNewYear={isNewYear} timeLeft={timeLeft} />

      {/* Content Overlay */}
      <div className="z-10 flex flex-col items-center justify-end w-full h-full px-4 pb-2 md:pb-6 text-center">
        <AnimatePresence mode="wait">
          {!isNewYear ? (
            <motion.div
              key="countdown"
              exit={{ scale: 1.5, opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 1 }}
              className="flex flex-col items-center mb-0"
            >
              {/* Tribute Message HIDDEN during countdown per user request */}

              {/* Countdown placed at bottom */}
              <CountdownDisplay timeLeft={timeLeft} />
            </motion.div>
          ) : (
            <motion.div
              key="celebration"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.4, duration: 1 }}
              className="flex flex-col items-center mb-2 gap-8"
            >
              {/* Just show the tribute message at bottom, like countdown was */}
              <TributeMessage />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer / Branding */}
      <div className="absolute bottom-4 left-0 right-0 text-center z-10 opacity-30 text-xs uppercase tracking-widest pointer-events-none">
        <Link href="https://sopheap.dev" target="_blank">Created by Sopheap Om</Link>
      </div>
    </main>
  );
}
