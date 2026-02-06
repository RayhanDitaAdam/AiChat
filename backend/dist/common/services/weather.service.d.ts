/**
 * Weather Service (Simulated)
 * This service provides mock weather data.
 * In a real-world scenario, you would replace this with a call to an external API like OpenWeatherMap.
 */
export declare class WeatherService {
    /**
     * Get current weather for a specific location (simulated)
     */
    static getCurrentWeather(lat?: number | null, lng?: number | null): Promise<{
        temperature: number;
        condition: string;
        humidity: number;
        location_hint: string;
    }>;
    /**
     * Logic check: Is it "Fruit Weather"?
     */
    static isProactiveFruitWeather(weather: any): any;
}
//# sourceMappingURL=weather.service.d.ts.map