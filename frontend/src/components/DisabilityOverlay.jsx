import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Accessibility, Mic, Volume2, X, Store, Package, MapPin, Loader2, SearchX } from 'lucide-react';

const DisabilityOverlay = ({
    isActive,
    onClose,
    status, // 'greeting', 'listening_store', 'listening_product', 'loading', 'result', 'not_found'
    transcript,
    stores = [],
    selectedStore,
    productResult
}) => {
    if (!isActive) return null;

    const statusConfig = {
        greeting: {
            label: 'Sistem Siap',
            title: 'Halo! Kamu mau mencari apa?',
            icon: <Volume2 className="w-12 h-12 text-indigo-600" />,
            color: 'indigo'
        },
        listening_store: {
            label: 'Pilih Toko',
            title: 'Toko mana yang ingin kamu kunjungi?',
            icon: <Mic className="w-12 h-12 text-indigo-600" />,
            color: 'indigo'
        },
        listening_product: {
            label: 'Mencari Produk',
            title: `Kamu mau cari apa di ${selectedStore?.name}?`,
            icon: <Mic className="w-12 h-12 text-indigo-600" />,
            color: 'indigo'
        },
        loading: {
            label: 'Sedang Mencari...',
            title: 'Sebentar ya, saya carikan dulu...',
            icon: <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />,
            color: 'indigo'
        },
        result: {
            label: 'Produk Ditemukan!',
            title: productResult?.name || 'Ditemukan!',
            icon: <Package className="w-12 h-12 text-green-600" />,
            color: 'green'
        },
        not_found: {
            label: 'Tidak Ditemukan',
            title: 'Produk tidak ada di toko ini',
            icon: <SearchX className="w-12 h-12 text-red-400" />,
            color: 'red'
        }
    };

    const current = statusConfig[status] || statusConfig.greeting;

    return (
        <AnimatePresence>
            <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[10000] bg-zinc-950 text-white flex flex-col p-8 md:p-12 overflow-hidden font-sans"
                role="dialog"
                aria-live="assertive"
                aria-label="Mode Disabilitas Aktif"
            >
                {/* Animated background glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                    <Motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.4, 0.1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className={`absolute inset-0 blur-[150px] rounded-full ${status === 'result' ? 'bg-green-500' :
                                status === 'not_found' ? 'bg-red-500' :
                                    status === 'loading' ? 'bg-yellow-500' :
                                        'bg-indigo-500'
                            }`}
                    />
                </div>

                {/* Header */}
                <header className="relative z-10 flex justify-between items-center mb-12">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white flex items-center justify-center rounded-2xl text-zinc-950">
                            <Accessibility className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight uppercase italic">Mode Disabilitas</h1>
                            <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Ucapkan "Akhiri" untuk keluar</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors border border-white/10"
                        aria-label="Tutup mode disabilitas"
                    >
                        <X className="w-8 h-8" />
                    </button>
                </header>

                {/* Main Content */}
                <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center max-w-4xl mx-auto w-full">
                    <AnimatePresence mode="wait">
                        <Motion.div
                            key={status}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-8 w-full"
                        >
                            {/* Status Icon */}
                            <div className="flex justify-center">
                                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl ${status === 'result' ? 'bg-green-50 shadow-green-500/20' :
                                        status === 'not_found' ? 'bg-red-50 shadow-red-500/20' :
                                            'bg-white shadow-indigo-500/20'
                                    }`}>
                                    {current.icon}
                                </div>
                            </div>

                            {/* Status Label + Title */}
                            <div className="space-y-4">
                                <p className={`font-bold uppercase tracking-[0.3em] text-sm ${status === 'result' ? 'text-green-400' :
                                        status === 'not_found' ? 'text-red-400' :
                                            status === 'loading' ? 'text-yellow-400' :
                                                'text-indigo-400'
                                    }`}>
                                    {current.label}
                                </p>
                                <h2 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
                                    {current.title}
                                </h2>
                            </div>

                            {/* Store List */}
                            {status === 'listening_store' && stores.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-4">
                                    {stores.map(s => (
                                        <div key={s.id} className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xl font-bold">
                                            <Store className="inline w-5 h-5 mr-2 opacity-50" />
                                            {s.name}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Product Result Card */}
                            {status === 'result' && productResult && (
                                <div className="bg-white text-zinc-950 p-10 rounded-[3rem] shadow-2xl space-y-8 text-left max-w-2xl mx-auto border-4 border-green-200">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-4xl font-bold tracking-tight mb-2">{productResult.name}</h3>
                                            <p className="text-green-600 font-bold uppercase tracking-widest text-xs">Produk Ditemukan ✓</p>
                                        </div>
                                        {productResult.price && (
                                            <div className="text-3xl font-bold text-indigo-600 italic shrink-0">
                                                {productResult.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-zinc-100">
                                        <div className="p-4 bg-zinc-50 rounded-2xl flex items-center gap-3">
                                            <Package className="w-6 h-6 text-zinc-400 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Rak</p>
                                                <p className="text-2xl font-bold truncate">{productResult.rak || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-zinc-50 rounded-2xl flex items-center gap-3">
                                            <MapPin className="w-6 h-6 text-zinc-400 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Lorong</p>
                                                <p className="text-2xl font-bold truncate">{productResult.aisle || '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-zinc-400 font-medium">Sebutkan nama barang lain untuk mencari lagi.</p>
                                </div>
                            )}

                            {/* Not Found State */}
                            {status === 'not_found' && (
                                <div className="bg-red-950/30 border border-red-500/20 p-8 rounded-3xl max-w-lg mx-auto">
                                    <p className="text-xl text-red-300 font-bold">
                                        Mohon maaf, barang tidak ditemukan di {selectedStore?.name}.
                                    </p>
                                    <p className="text-white/40 mt-2 text-sm">Sebutkan nama barang lain untuk mencoba lagi.</p>
                                </div>
                            )}
                        </Motion.div>
                    </AnimatePresence>
                </main>

                {/* Footer: Live Transcript */}
                <footer className="relative z-10 py-8 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3 text-white/40">
                        <Motion.div
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-2 h-2 bg-indigo-500 rounded-full"
                        />
                        <span className="font-bold uppercase tracking-[0.2em] text-xs">Input Suara Langsung</span>
                    </div>
                    <div className="w-full max-w-2xl bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 min-h-[80px] flex items-center justify-center shadow-inner">
                        <p className="text-xl font-bold text-indigo-300 italic">
                            "{transcript || 'Mendengarkan...'}"
                        </p>
                    </div>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                        Ucapkan "Akhiri" atau "Selesai" untuk keluar
                    </p>
                </footer>
            </Motion.div>
        </AnimatePresence>
    );
};

export default DisabilityOverlay;
