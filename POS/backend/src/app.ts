import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';

// Import Routes
import authRoutes from './modules/auth/auth.routes.js';
import productRoutes from './modules/product/product.routes.js';
import transactionRoutes from './modules/transaction/transaction.routes.js';
import memberRoutes from './modules/member/member.routes.js';
import healthRoutes from './modules/health/health.routes.js';
import settingsRoutes from './modules/settings/settings.routes.js';
import rewardRoutes from './modules/reward/reward.routes.js';
import reportRoutes from './modules/report/report.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

// Basic Routes
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Module Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/reports', reportRoutes);

// Error Handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ status: 'error', message: err.message || 'Internal Server Error' });
});

export default app;
