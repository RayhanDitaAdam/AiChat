import express from 'express';
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

const app: Express = express();

app.use(cors());
app.use(express.json());

// Authentication routes
app.use('/api/auth', authRouter);

// User routes
app.use('/api/chat', chatRouter);
app.use('/api/rating', ratingRouter);
app.use('/api/reminder', reminderRouter);
app.use('/api/products', productRouter);

// Owner routes
app.use('/api', ownerRouter);

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

export default app;
