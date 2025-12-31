"use client";

import { motion } from "framer-motion";

export default function TributeMessage() {
    return (
        <div className="text-center z-10 relative px-4">
            <motion.div
                className="inline-block relative"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 1.5 }}
            >
                {/* Content - No box, just floating text */}
                <div className="relative space-y-4">
                    {/* Header - English */}
                    <h3 className="text-sm md:text-lg tracking-[0.4em] uppercase text-[#FFD700] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-[family-name:var(--font-orbitron)]">
                        Dedicated to our heroes
                    </h3>

                    {/* Khmer Text - Clean, No Box, Gold/White Gradient or solid to pop */}
                    <p className="text-lg md:text-3xl font-bold leading-relaxed text-transparent bg-clip-text bg-gradient-to-b from-white to-[#FFD700] drop-shadow-[0_2px_4px_rgba(0,0,0,1)] max-w-4xl mx-auto py-2">
                        សូមជូនពរដល់វីរកងទ័ពកម្ពុជាទាំងអស់ឱ្យជួបតែសុខសុវត្ថិភាព និងជោគជ័យគ្រប់ភារកិច្ច
                    </p>

                    {/* English Translation - Subtle */}
                    <p className="text-xs md:text-sm text-[#FFD700]/80 italic mt-2 tracking-wider font-light drop-shadow-md">
                        (Wishing our soldiers at the border safety and success in every mission.)
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
