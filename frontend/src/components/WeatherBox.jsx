import React, { useState, useEffect } from 'react';
import { WiRain, WiDaySunny, WiCloudy, WiSnow, WiFog } from 'react-icons/wi';

const WeatherBox = () => {
    const [weather, setWeather] = useState(null);

    const loadWeather = async () => {
        try {
            const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=-7.55&longitude=112.79&current_weather=true");
            const data = await res.json();
            if (data.current_weather) {
                setWeather(data.current_weather);
            }
        } catch (err) {
            console.error('Failed to fetch weather:', err);
        }
    };

    useEffect(() => {
        loadWeather();
        // Refresh every 5 minutes
        const timer = setInterval(loadWeather, 300000);
        return () => clearInterval(timer);
    }, []);

    if (!weather) return null;

    const getTheme = () => {
        const code = weather.weathercode;
        // WMO Weather interpretation codes (WW)
        // https://open-meteo.com/en/docs
        if (code === 0) {
            return { label: 'Sunny', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: WiDaySunny };
        }
        if ([1, 2, 3].includes(code)) {
            return { label: 'Cloudy', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: WiCloudy };
        }
        if ([45, 48].includes(code)) {
            return { label: 'Foggy', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: WiFog };
        }
        if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) {
            return { label: 'Rainy', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', icon: WiRain };
        }
        if ([71, 73, 75, 77, 85, 86].includes(code)) {
            return { label: 'Snowy', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: WiSnow };
        }
        return { label: 'Cloudy', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: WiCloudy };
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
                        {theme.label}
                    </p>
                    <p className="text-xs font-black text-slate-900 leading-tight">
                        {weather.temperature}°C
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WeatherBox;
