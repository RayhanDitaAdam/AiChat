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
        // Default to Surabaya coordinates if not provided
        const TARGET_LAT = lat ? parseFloat(lat.toFixed(2)) : -7.25;
        const TARGET_LNG = lng ? parseFloat(lng.toFixed(2)) : 112.75;
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
                location_hint: lat && lng ? `Near [${TARGET_LAT}, ${TARGET_LNG}]` : 'Surabaya Area'
            };

            // Update Cache
            this.cache.set(cacheKey, { data: result, timestamp: Date.now() });

            return result;
        } catch (error) {
            console.error('Weather Service Fetch Error:', error);
            // Fallback to a safe default if API fails
            return {
                temperature: 25,
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
        return weather && (weather.temperature >= 30 || weather.temperature <= 0);
    }

    /**
     * Get a localized proactive suggestion based on current weather
     */
    static getProactiveSuggestion(weather) {
        if (!weather) return "";

        if (weather.temperature >= 30) {
            const hotSuggestions = [
                "Eh cuacanya panas bgt nih bre, cari yang dingin-dingin yuk biar seger! Mungkin kamu bisa mencoba",
                "Aduuh terik bgt hari ini bre, butuh yang sejuk nih. Cobain yang segar-segar di toko kita yuk, kaya",
                "Cuaca Surabaya lagi 'membara' nih bre, jangan lupa hidrasi ya! Cek deh pilihan minuman dingin kita, misal"
            ];
            return hotSuggestions[Math.floor(Math.random() * hotSuggestions.length)];
        }

        if (weather.temperature <= 0) {
            const coldSuggestions = [
                "Wah gila bre, cuacanya dingin bgt hari ini! Biar anget, mending cari yang panas-panas yuk, coba cek",
                "Brrr... menusuk tulang nih dinginnya bre. Butuh asupan yang bikin tubuh hangat, mungkin kamu suka",
                "Cuacanya dingin bgt nih bre, jangan sampe masuk angin ya! Cek deh pilihan minuman atau makanan hangat kita, misal"
            ];
            return coldSuggestions[Math.floor(Math.random() * coldSuggestions.length)];
        }

        return ""; // Neutral range (0 < T < 30)
    }
} WeatherService.__initStatic(); WeatherService.__initStatic2();
