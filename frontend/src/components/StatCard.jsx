import React from 'react';
import { motion as Motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, delay, trend, valueClass }) => {
    return (
        <Motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.3 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] flex items-start justify-between group hover:border-indigo-100 transition-all hover:-translate-y-0.5"
        >
            <div className="space-y-1">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{title}</p>
                <div className="flex items-baseline gap-1">
                    <h3 className={`text-3xl font-bold tracking-tight ${valueClass ? valueClass : (trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-slate-900')
                        }`}>
                        {value}
                    </h3>
                </div>
            </div>
            <div className={`p-3 rounded-xl ${color.replace('shadow-sm', '')} text-white`}>
                <Icon className="w-5 h-5" />
            </div>
        </Motion.div>
    );
};

export default StatCard;
