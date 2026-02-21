import React, { useEffect, useContext } from 'react';
import { Accessibility, Mic, Volume2 } from 'lucide-react';
import { DisabilityContext } from '../context/DisabilityContext.js';
import { motion as Motion } from 'framer-motion';

/**
 * /disability route — public page, no login required.
 * Immediately triggers disability mode on mount.
 */
const DisabilityPage = () => {
    const { triggerGreeting, isDisabilityMode } = useContext(DisabilityContext);

    useEffect(() => {
        // Auto-trigger disability mode when this page is visited
        if (!isDisabilityMode) {
            // Small delay to let the page render first
            const timer = setTimeout(() => {
                triggerGreeting();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-8 font-sans">
            {/* Background glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <Motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.15, 0.05] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0 bg-indigo-600 blur-[200px] rounded-full"
                />
            </div>

            <div className="relative z-10 text-center space-y-8 max-w-lg">
                {/* Icon */}
                <Motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/30"
                >
                    <Accessibility className="w-12 h-12 text-indigo-600" />
                </Motion.div>

                <div className="space-y-4">
                    <h1 className="text-5xl font-black tracking-tight">Mode Disabilitas</h1>
                    <p className="text-xl text-white/60 leading-relaxed">
                        Asisten suara sedang menyiapkan diri. Sebentar lagi kamu akan mendengar sapaan dari saya.
                    </p>
                </div>

                {/* Feature hints */}
                <div className="grid grid-cols-1 gap-4 text-left">
                    {[
                        { icon: <Volume2 className="w-5 h-5" />, text: 'AI akan menyapa kamu dengan suara' },
                        { icon: <Mic className="w-5 h-5" />, text: 'Bicara untuk mencari produk' },
                        { icon: <Accessibility className="w-5 h-5" />, text: 'Ucapkan "Akhiri" untuk keluar' },
                    ].map((item, i) => (
                        <Motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.15 + 0.3 }}
                            className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4"
                        >
                            <div className="text-indigo-400">{item.icon}</div>
                            <p className="text-white/70 font-medium">{item.text}</p>
                        </Motion.div>
                    ))}
                </div>

                <p className="text-zinc-600 text-sm">
                    Tidak perlu login. Halaman ini dirancang untuk pengguna tunanetra.
                </p>
            </div>
        </div>
    );
};

export default DisabilityPage;
