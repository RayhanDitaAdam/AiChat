/**
 * Weather Service (Simulated)
 * This service provides mock weather data. 
 * In a real-world scenario, you would replace this with a call to an external API like OpenWeatherMap.
 */
export class WeatherService {
    /**
     * Get current weather for a specific location (simulated)
     */
    static async getCurrentWeather(lat?: number | null, lng?: number | null) {
        // For demonstration purposes, we'll return a "Hot and Sunny" weather condition
        // as requested to trigger the proactive AI fruit suggestion.

        return {
            temperature: 36, // °C
            condition: 'Hot & Sunny',
            humidity: 65,
            location_hint: lat && lng ? `Near [${lat.toFixed(2)}, ${lng.toFixed(2)}]` : 'Current Area'
        };
    }

    /**
     * Logic check: Is it "Fruit Weather"?
     */
    static isProactiveFruitWeather(weather: any) {
        return weather.temperature > 30 || weather.condition.toLowerCase().includes('hot');
    }
}
