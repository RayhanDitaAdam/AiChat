import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Accessibility, Mic, Volume2, X, Store, Package, MapPin } from 'lucide-react';

const DisabilityOverlay = ({
    isActive,
    onClose,
    status, // 'greeting', 'listening_store', 'listening_product', 'result'
    transcript,
    stores = [],
    selectedStore,
    productResult
}) => {
    if (!isActive) return null;

    return (
        <AnimatePresence>
            <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[10000] bg-zinc-950 text-white flex flex-col p-8 md:p-12 overflow-hidden font-sans"
            >
                {/* Background pulse for voice activity */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                    <Motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-indigo-500 blur-[150px] rounded-full"
                    />
                </div>

                {/* Header */}
                <header className="relative z-10 flex justify-between items-center mb-12">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white flex items-center justify-center rounded-2xl text-zinc-950">
                            <Accessibility className="w-7 h-7" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tighter uppercase italic">Disability Mode</h1>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors border border-white/10"
                    >
                        <X className="w-8 h-8" />
                    </button>
                </header>

                {/* Main Content Area */}
                <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center max-w-4xl mx-auto w-full">
                    <AnimatePresence mode="wait">
                        <Motion.div
                            key={status}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="space-y-8"
                        >
                            {/* Status Icon */}
                            <div className="flex justify-center">
                                <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                                    {status === 'result' ? (
                                        <Package className="w-12 h-12 text-indigo-600" />
                                    ) : (
                                        <Mic className="w-12 h-12 text-indigo-600" />
                                    )}
                                </div>
                            </div>

                            {/* Main Text */}
                            <div className="space-y-4">
                                <p className="text-indigo-400 font-bold uppercase tracking-[0.3em] text-sm">
                                    {status === 'greeting' && "System Ready"}
                                    {status === 'listening_store' && "Choosing Store"}
                                    {status === 'listening_product' && "Finding Product"}
                                    {status === 'result' && "Product Located"}
                                </p>
                                <h2 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
                                    {status === 'greeting' && "Hello, how can I help you today?"}
                                    {status === 'listening_store' && "Which store do you want to visit?"}
                                    {status === 'listening_product' && `What do you want to find in ${selectedStore?.name}?`}
                                    {status === 'result' && productResult?.name}
                                </h2>
                            </div>

                            {/* Results / List */}
                            <div className="w-full">
                                {status === 'listening_store' && stores.length > 0 && (
                                    <div className="flex flex-wrap justify-center gap-4">
                                        {stores.map(s => (
                                            <div key={s.id} className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xl font-bold">
                                                {s.name}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {status === 'result' && productResult && (
                                    <div className="bg-white text-zinc-950 p-10 rounded-[3rem] shadow-2xl space-y-8 text-left max-w-2xl mx-auto border-4 border-indigo-200">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-4xl font-black tracking-tight mb-2">{productResult.name}</h3>
                                                <p className="text-indigo-600 font-black uppercase tracking-widest text-xs">Inventory Match</p>
                                            </div>
                                            <div className="text-5xl font-black text-indigo-600 italic">
                                                {productResult.price?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-zinc-100">
                                            <div className="space-y-3">
                                                <div className="p-3 bg-zinc-50 rounded-2xl flex items-center gap-3">
                                                    <MapPin className="w-6 h-6 text-zinc-400" />
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Shelf / Rak</p>
                                                        <p className="text-2xl font-black truncate">{productResult.rak || '-'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="p-3 bg-zinc-50 rounded-2xl flex items-center gap-3">
                                                    <Store className="w-6 h-6 text-zinc-400" />
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Aisle / Lorong</p>
                                                        <p className="text-2xl font-black truncate">{productResult.aisle || '-'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Motion.div>
                    </AnimatePresence>
                </main>

                {/* Footer: Live Transcript */}
                <footer className="relative z-10 py-12 flex flex-col items-center gap-6">
                    <div className="flex items-center gap-4 text-white/40">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                        <span className="font-bold uppercase tracking-[0.2em] text-xs">Live Voice Input</span>
                    </div>
                    <div className="w-full max-w-2xl bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 min-h-[100px] flex items-center justify-center shadow-inner">
                        <p className="text-2xl font-bold text-indigo-300 italic">
                            "{transcript || "Listening..."}"
                        </p>
                    </div>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                        Say "Akhiri" to Exit Mode
                    </p>
                </footer>
            </Motion.div>
        </AnimatePresence>
    );
};

export default DisabilityOverlay;
