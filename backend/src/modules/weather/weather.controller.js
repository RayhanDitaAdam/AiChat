
import { WeatherService } from '../../common/services/weather.service.js';

export class WeatherController {
    async getCurrentWeather(req, res) {
        try {
            const { lat, lng } = req.query;
            const latitude = lat ? parseFloat(lat ) : undefined;
            const longitude = lng ? parseFloat(lng ) : undefined;

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
