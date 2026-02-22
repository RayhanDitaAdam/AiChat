import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, CheckCircle2, ChevronRight } from 'lucide-react';

const ConsentModal = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [step, setStep] = useState(1);

    useEffect(() => {
        const hasConsented = localStorage.getItem('user-consent-v1');
        if (!hasConsented) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('user-consent-v1', 'true');
        setIsVisible(false);
    };

    const nextStep = () => setStep(prev => prev + 1);

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />

                    <Motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
                    >
                        {/* Header Gradient */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-indigo-600 to-violet-600 opacity-[0.03]" />

                        <div className="p-8 sm:p-10">
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                                    <ShieldCheck className="w-8 h-8" />
                                </div>
                                <button
                                    onClick={() => setIsVisible(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {step === 1 ? (
                                    <Motion.div
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key="step1"
                                    >
                                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
                                            Your Privacy Matters
                                        </h2>
                                        <p className="text-slate-500 font-medium leading-relaxed">
                                            Before you chat with <span className="text-indigo-600 font-bold text-lg">Heart.</span>, we want to ensure you're comfortable with how we handle your data to provide the best shopping experience.
                                        </p>

                                        <div className="mt-8 space-y-4">
                                            <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 items-center">
                                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                </div>
                                                <p className="text-xs font-bold text-slate-600 leading-tight">
                                                    We use AI to help you find products quickly and efficiently.
                                                </p>
                                            </div>
                                            <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 items-center">
                                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                </div>
                                                <p className="text-xs font-bold text-slate-600 leading-tight">
                                                    Your chat history is saved to personalize your future visits.
                                                </p>
                                            </div>
                                        </div>
                                    </Motion.div>
                                ) : (
                                    <Motion.div
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key="step2"
                                    >
                                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
                                            Ready to Go?
                                        </h2>
                                        <p className="text-slate-500 font-medium leading-relaxed">
                                            By clicking accept, you agree to our <span className="text-indigo-600 underline">Privacy Policy</span> and <span className="text-indigo-600 underline">Terms of Service</span> regarding AI-assisted shopping.
                                        </p>
                                        <div className="mt-8 p-6 bg-indigo-50/50 border border-indigo-100 rounded-[2rem]">
                                            <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 text-center">Data Usage</h4>
                                            <p className="text-xs text-indigo-900/70 font-bold text-center leading-relaxed">
                                                We never sell your personal data. We only use it to improve your experience with our shopping assistant.
                                            </p>
                                        </div>
                                    </Motion.div>
                                )}
                            </div>

                            <div className="mt-12 flex gap-4">
                                {step === 1 ? (
                                    <button
                                        onClick={nextStep}
                                        className="w-full py-5 bg-zinc-900 text-white rounded-2.5xl font-bold text-lg hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 group active:scale-[0.98] shadow-xl shadow-zinc-200"
                                    >
                                        Learn More
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleAccept}
                                        className="w-full py-5 bg-indigo-600 text-white rounded-2.5xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-xl shadow-indigo-100"
                                    >
                                        Accept & Continue
                                    </button>
                                )}
                            </div>
                        </div>
                    </Motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConsentModal;
