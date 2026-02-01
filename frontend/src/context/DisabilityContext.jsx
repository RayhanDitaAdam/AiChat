import React, { useState, useEffect, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { X, Accessibility } from 'lucide-react';
import { DisabilityContext } from './DisabilityContext.js';

export const DisabilityProvider = ({ children }) => {
    const [isDisabilityMode, setIsDisabilityMode] = useState(false);
    const [lastShake, setLastShake] = useState(0);

    const speak = useCallback((text) => {
        if (!window.speechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US'; // Default to English as requested

        // Try to find a nice female voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Female'));
        if (preferredVoice) utterance.voice = preferredVoice;

        window.speechSynthesis.speak(utterance);
    }, []);

    const triggerGreeting = useCallback(() => {
        speak("Welcome to AI shopping assistant, what can i do for you");
        setIsDisabilityMode(true);
    }, [speak]);

    // Shake Detection logic
    useEffect(() => {
        let lastX, lastY, lastZ;
        const threshold = 15; // Adjusted for sensitivity

        const handleMotion = (event) => {
            const acceleration = event.accelerationIncludingGravity;
            if (!acceleration) return;

            const { x, y, z } = acceleration;
            if (lastX !== undefined) {
                const deltaX = Math.abs(lastX - x);
                const deltaY = Math.abs(lastY - y);
                const deltaZ = Math.abs(lastZ - z);

                if ((deltaX > threshold && deltaY > threshold) || (deltaX > threshold && deltaZ > threshold) || (deltaY > threshold && deltaZ > threshold)) {
                    const now = Date.now();
                    if (now - lastShake > 2000) { // Throttle shake detection to every 2 seconds
                        setLastShake(now);
                        if (!isDisabilityMode) {
                            triggerGreeting();
                        }
                    }
                }
            }

            lastX = x;
            lastY = y;
            lastZ = z;
        };

        window.addEventListener('devicemotion', handleMotion);
        return () => window.removeEventListener('devicemotion', handleMotion);
    }, [isDisabilityMode, lastShake, triggerGreeting]);

    // Shake detection is the primary activation trigger

    const value = {
        isDisabilityMode,
        setIsDisabilityMode,
        triggerGreeting,
        speak
    };


    return (
        <DisabilityContext.Provider value={value}>
            {children}
            <AnimatePresence>
                {isDisabilityMode && (
                    <Motion.button
                        initial={{ scale: 0, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0, opacity: 0, y: 20 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            setIsDisabilityMode(false);
                            window.speechSynthesis.cancel();
                        }}
                        className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-6 py-4 bg-rose-500 text-white rounded-full font-black text-sm shadow-2xl shadow-rose-200 border-2 border-white transition-all active:scale-95 group"
                    >
                        <div className="relative">
                            <Accessibility className="w-5 h-5 animate-pulse" />
                            <div className="absolute -top-1 -right-1">
                                <X className="w-3 h-3 bg-white text-rose-500 rounded-full border border-rose-500" />
                            </div>
                        </div>
                        <span className="tracking-tight">Disable Accessibility</span>
                    </Motion.button>
                )}
            </AnimatePresence>
        </DisabilityContext.Provider>
    );
};
