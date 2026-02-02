import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Express } from 'express';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

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


// Owner routes
app.use('/api', ownerRouter);

// Admin routes
app.use('/api/admin', adminRouter);

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

export default app;
