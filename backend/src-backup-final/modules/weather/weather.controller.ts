import type { Request, Response } from 'express';
import { WeatherService } from '../../common/services/weather.service.js';

export class WeatherController {
    async getCurrentWeather(req: Request, res: Response) {
        try {
            const { lat, lng } = req.query;
            const latitude = lat ? parseFloat(lat as string) : undefined;
            const longitude = lng ? parseFloat(lng as string) : undefined;

            const weather = await WeatherService.getCurrentWeather(latitude, longitude);
            return res.json({
                status: 'success',
                data: weather
            });
        } catch (error) {
            console.error('Weather Controller Error:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Failed to fetch weather data'
            });
        }
    }
}
