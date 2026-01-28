import React from 'react';
import { motion as Motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, delay }) => {
    return (
        <Motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.3 }}
            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-colors"
        >
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${color} shadow-sm transition-opacity group-hover:opacity-90`}>
                <Icon className="w-6 h-6" />
            </div>
        </Motion.div>
    );
};

export default StatCard;
