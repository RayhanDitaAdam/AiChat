import { Router } from 'express';
import { WeatherController } from './weather.controller.js';
const router = Router();
const weatherController = new WeatherController();
router.get('/', (req, res) => weatherController.getCurrentWeather(req, res));
export default router;
//# sourceMappingURL=weather.route.js.map