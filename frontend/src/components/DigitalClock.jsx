import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const DigitalClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl shadow-sm">
            <Clock className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span className="text-sm font-black text-slate-700 tabular-nums tracking-tight num-montserrat">
                {time.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                })}
            </span>
        </div>
    );
};

export default DigitalClock;
