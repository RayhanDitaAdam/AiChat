import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet as WalletIcon, Rocket, ShieldCheck, Zap } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

const Wallet = () => {
    return (
        <div className="max-w-7xl h-[70vh] flex flex-col">

            <div className="flex-1 flex flex-col items-center justify-center space-y-12">
                <Motion.div
                    initial={{ rotate: -10, scale: 0.9 }}
                    animate={{ rotate: 0, scale: 1 }}
                    className="w-32 h-32 bg-indigo-600 rounded-[3rem] shadow-2xl flex items-center justify-center relative shadow-indigo-200"
                >
                    <WalletIcon className="w-16 h-16 text-white" />
                    <div className="absolute -top-4 -right-4 bg-emerald-500 text-white px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg">v2 Feature</div>
                </Motion.div>

                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight">Heart Wallet<span className="text-indigo-600">.</span></h1>
                    <p className="text-slate-500 font-medium text-lg max-w-md mx-auto">
                        Secure checkout, rewards, and integrated payments are currently under active development.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl pt-8">
                    {[
                        { icon: Zap, label: 'Fast Pay' },
                        { icon: ShieldCheck, label: 'Secure' },
                        { icon: Rocket, label: 'Rewards' }
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 text-center space-y-2 opacity-50 grayscale select-none cursor-not-allowed">
                            <item.icon className="w-6 h-6 text-slate-400 mx-auto" />
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-slate-900 text-white px-8 py-4 rounded-2xl flex items-center gap-3">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold uppercase tracking-widest underline decoration-indigo-500 underline-offset-4 decoration-2">Coming Soon on Version 2</span>
                </div>
            </div>
        </div>
    );
};

export default Wallet;
