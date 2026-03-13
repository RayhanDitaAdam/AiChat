import axios from 'axios';

/**
 * Weather Service
 * This service provides real-time weather data from Open-Meteo.
 */
export class WeatherService {
    static __initStatic() { this.cache = new Map() }
    static __initStatic2() { this.CACHE_DURATION = 30 * 60 * 1000 } // 30 minutes

    /**
     * Get current weather for a specific location
     */
    static async getCurrentWeather(lat, lng) {
        // Default to Southampton coordinates if not provided (as requested by user)
        const TARGET_LAT = lat ? parseFloat(lat.toFixed(2)) : 50.91;
        const TARGET_LNG = lng ? parseFloat(lng.toFixed(2)) : -1.40;
        const cacheKey = `${TARGET_LAT}_${TARGET_LNG}`;

        // Check Cache
        const cached = this.cache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < this.CACHE_DURATION)) {
            console.log(`[WeatherService] Cache hit for ${cacheKey}`);
            return cached.data;
        }

        try {
            console.log(`[WeatherService] Fetching fresh weather for ${cacheKey}...`);
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${TARGET_LAT}&longitude=${TARGET_LNG}&current_weather=true`;
            const response = await axios.get(url);
            const data = response.data.current_weather;

            if (!data) throw new Error('No weather data returned');

            const result = {
                temperature: data.temperature,
                windspeed: data.windspeed,
                condition: this.interpretWeatherCode(data.weathercode),
                weathercode: data.weathercode,
                humidity: 65,
                location_hint: lat && lng ? `Near [${TARGET_LAT}, ${TARGET_LNG}]` : 'Southampton Area'
            };

            // Update Cache
            this.cache.set(cacheKey, { data: result, timestamp: Date.now() });

            return result;
        } catch (error) {
            console.error('Weather Service Fetch Error:', error);
            // Fallback to a safe default if API fails
            return {
                temperature: 13,
                condition: 'Clear',
                humidity: 60,
                location_hint: 'Location Unavailable'
            };
        }
    }

    /**
     * Interpret WMO Weather interpretation codes
     */
    static interpretWeatherCode(code) {
        if (code === 0) return 'Sunny';
        if ([1, 2, 3].includes(code)) return 'Cloudy';
        if ([45, 48].includes(code)) return 'Foggy';
        if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) return 'Rainy';
        if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snowy';
        return 'Cloudy';
    }

    /**
     * Logic check: Is it "Proactive" Weather? (Hot >= 30 or Cold <= 0)
     */
    static isProactiveFruitWeather(weather) {
        return weather && weather.condition !== 'NONE' && (weather.temperature >= 30 || weather.temperature <= 0);
    }

    /**
     * Get a localized proactive suggestion based on current weather
     */
    static getProactiveSuggestion(weather) {
        if (!weather) return "";

        if (weather.temperature >= 30) {
            const hotSuggestions = [
                "Eh cuacanya panas bgt nih bre, jangan lupa banyak minum air biar gak dehidrasi ya! Stay safe!",
                "Aduuh terik bgt hari ini bre, cuaca lagi panas-panasnya nih. Jaga kondisi tubuh ya!",
                "Cuaca Surabaya lagi 'membara' nih bre, kalo bisa neduh dulu biar gak kena heatstroke. Stay hydrated!"
            ];
            return hotSuggestions[Math.floor(Math.random() * hotSuggestions.length)];
        }

        if (weather.temperature <= 0) {
            const coldSuggestions = [
                "Wah gila bre, cuacanya dingin bgt hari ini! Pake jaket ya biar gak masuk angin. Stay warm!",
                "Brrr... menusuk tulang nih dinginnya bre. Jaga suhu tubuh tetep anget ya!",
                "Cuacanya dingin bgt nih bre, enak nih kalo minum yang anget-anget. Jaga kesehatan ya!"
            ];
            return coldSuggestions[Math.floor(Math.random() * coldSuggestions.length)];
        }

        return ""; // Neutral range (0 < T < 30)
    }
} WeatherService.__initStatic(); WeatherService.__initStatic2();
