/**
 * Weather Service
 * This service provides real-time weather data from Open-Meteo.
 */
export declare class WeatherService {
    private static cache;
    private static CACHE_DURATION;
    /**
     * Get current weather for a specific location
     */
    static getCurrentWeather(lat?: number | null, lng?: number | null): Promise<any>;
    /**
     * Interpret WMO Weather interpretation codes
     */
    private static interpretWeatherCode;
    /**
     * Logic check: Is it "Fruit Weather"?
     */
    static isProactiveFruitWeather(weather: any): any;
}
//# sourceMappingURL=weather.service.d.ts.map