import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const LogoutModal = ({ isOpen, onClose, onConfirm, userEmail }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <Motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden"
                    >
                        <div className="flex flex-col items-center justify-center px-6 py-8 sm:p-10">
                            <p className="text-center text-2xl font-semibold text-zinc-900 text-balance leading-tight">
                                Are you sure you want to log out?
                            </p>
                            <p className="text-zinc-500 mt-4 mb-8 text-center text-lg leading-relaxed">
                                Log out of Heart as <span className="font-medium text-zinc-800">{userEmail}</span>?
                            </p>

                            <button
                                onClick={onConfirm}
                                className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-bold text-lg transition-all active:scale-[0.98] mb-3 shadow-lg shadow-zinc-200"
                            >
                                Log out
                            </button>

                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-2xl font-bold text-lg transition-all active:scale-[0.98]"
                            >
                                Cancel
                            </button>
                        </div>
                    </Motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default LogoutModal;
