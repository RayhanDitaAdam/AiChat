import React, { useState, useEffect } from 'react';
import { fetchWeather } from '../services/api.js';
import { WiRain, WiDaySunny, WiCloudy, WiSnow } from 'react-icons/wi';

const WeatherBox = () => {
    const [weather, setWeather] = useState(null);

    useEffect(() => {
        const loadWeather = async () => {
            try {
                // Try to get geolocation if possible for real data later, 
                // but for now the backend handles the mock.
                const res = await fetchWeather();
                if (res.status === 'success') {
                    setWeather(res.data);
                }
            } catch (err) {
                console.error('Failed to fetch weather:', err);
            }
        };
        loadWeather();
        // Refresh every 5 minutes
        const timer = setInterval(loadWeather, 300000);
        return () => clearInterval(timer);
    }, []);

    if (!weather) return null;

    const getTheme = () => {
        const condition = weather.condition.toLowerCase();
        if (condition.includes('hot') || condition.includes('sunny')) {
            return { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: WiDaySunny };
        }
        if (condition.includes('rain')) {
            return { color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', icon: WiRain };
        }
        if (condition.includes('cold') || condition.includes('snow')) {
            return { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: WiSnow };
        }
        return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: WiCloudy };
    };

    const theme = getTheme();
    const Icon = theme.icon;

    return (
        <div className={`mx-3 mb-2 p-3 rounded-2xl border ${theme.bg} ${theme.border} transition-all duration-500`}>
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme.color} shrink-0 bg-white/5`}>
                    <Icon className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-[9px] font-black uppercase tracking-widest ${theme.color} mb-0.5`}>
                        Currently {weather.condition}
                    </p>
                    <p className="text-xs font-black text-white leading-tight">
                        {weather.temperature}°C
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WeatherBox;
