"use client";

import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

interface SoundToggleProps {
    muted: boolean;
    onToggle: () => void;
}

export default function SoundToggle({ muted, onToggle }: SoundToggleProps) {
    return (
        <motion.button
            className="fixed top-4 right-4 z-50 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors shadow-lg group"
            onClick={onToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {muted ? (
                <VolumeX className="w-6 h-6 text-red-400" />
            ) : (
                <Volume2 className="w-6 h-6 text-blue-300 group-hover:text-blue-100 placeholder:animate-pulse" />
            )}

            {/* Tooltip */}
            <span className="absolute top-full right-0 mt-2 text-xs text-white/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-black/50 px-2 py-1 rounded">
                {muted ? "Unmute Sound" : "Mute Sound"}
            </span>
        </motion.button>
    );
}
