import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import authRouter from './modules/auth/auth.route.js';
import chatRouter from './modules/chat/chat.route.js';
import ratingRouter from './modules/rating/rating.route.js';
import reminderRouter from './modules/reminder/reminder.route.js';
import productRouter from './modules/product/product.route.js';
import ownerRouter from './modules/owner/owner.route.js';
import adminRouter from './modules/admin/admin.route.js';
import shoppingListRouter from './modules/shopping-list/shopping-list.route.js';
import printRouter from './modules/print/print.route.js';
import weatherRouter from './modules/weather/weather.route.js';
import facilityRouter from './modules/facility/facility.route.js';
import vacancyRouter from './modules/vacancy/vacancy.route.js';
import rewardRouter from './modules/reward/reward.route.js';
import buildingRouter from './modules/building/building.route.js';
import statRouter from './modules/stat/stat.route.js';
import memberRouter from './modules/member/member.route.js';
import transactionRouter from './modules/transaction/transaction.route.js';
import reportRouter from './modules/report/report.route.js';
import healthRouter from './modules/health/health.route.js';
import posSettingsRouter from './modules/pos-settings/pos-settings.route.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());
// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Authentication routes
app.use('/api/auth', authRouter);
// User routes
app.use('/api/chat', chatRouter);
app.use('/api/rating', ratingRouter);
app.use('/api/reminder', reminderRouter);
app.use('/api/products', productRouter);
app.use('/api/shopping-list', shoppingListRouter);
app.use('/api/print', printRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/facility', facilityRouter);
app.use('/api/vacancies', vacancyRouter);
app.use('/api/rewards', rewardRouter);
app.use('/api/buildings', buildingRouter);
app.use('/api/stats', statRouter);
// POS Routes
app.use('/api/pos/members', memberRouter);
app.use('/api/pos/transactions', transactionRouter);
app.use('/api/pos/reports', reportRouter);
app.use('/api/pos/rewards', rewardRouter);
app.use('/api/pos/health', healthRouter);
app.use('/api/pos/settings', posSettingsRouter);
// Owner routes
app.use('/api', ownerRouter);
// Admin routes
app.use('/api/admin', adminRouter);
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});
export default app;
//# sourceMappingURL=app.js.map