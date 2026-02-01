import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toaster = ({ toasts, removeToast }) => {
    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <Motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="pointer-events-auto"
                    >
                        <div className={`
                            flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md min-w-[320px]
                            ${toast.type === 'success' ? 'bg-emerald-50/90 border-emerald-100 text-emerald-900' :
                                toast.type === 'error' ? 'bg-rose-50/90 border-rose-100 text-rose-900' :
                                    toast.type === 'warning' ? 'bg-amber-50/90 border-amber-100 text-amber-900' :
                                        'bg-indigo-50/90 border-indigo-100 text-indigo-900'}
                        `}>
                            <div className={`
                                w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                                ${toast.type === 'success' ? 'bg-emerald-500 text-white' :
                                    toast.type === 'error' ? 'bg-rose-500 text-white' :
                                        toast.type === 'warning' ? 'bg-amber-500 text-white' :
                                            'bg-indigo-500 text-white'}
                            `}>
                                {toast.type === 'success' ? <CheckCircle className="w-6 h-6" /> :
                                    toast.type === 'error' ? <XCircle className="w-6 h-6" /> :
                                        toast.type === 'warning' ? <AlertCircle className="w-6 h-6" /> :
                                            <Info className="w-6 h-6" />}
                            </div>

                            <div className="flex-1">
                                <p className="text-sm font-black tracking-tight leading-tight">
                                    {toast.type.toUpperCase()}
                                </p>
                                <p className="text-xs font-bold opacity-70 mt-0.5">
                                    {toast.message}
                                </p>
                            </div>

                            <button
                                onClick={() => removeToast(toast.id)}
                                className="p-1 px-2 hover:bg-black/5 rounded-lg transition-colors group"
                            >
                                <X className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                            </button>
                        </div>
                    </Motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default Toaster;
