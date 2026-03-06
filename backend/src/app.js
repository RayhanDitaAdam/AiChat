 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { doubleCsrf } from 'csrf-csrf';
import cookieParser from 'cookie-parser';
import { queryLimiter } from './common/middleware/query-limiter.middleware.js';

dotenv.config();

import authRouter from './modules/auth/auth.route.js';
import chatRouter from './modules/chat/chat.route.js';
import ratingRouter from './modules/rating/rating.route.js';
import reminderRouter from './modules/reminder/reminder.route.js';
import productRouter from './modules/product/product.route.js';
import ownerRouter from './modules/owner/owner.route.js';
import contributorRouter from './modules/contributor/contributor.route.js';
import adminRouter from './modules/admin/admin.route.js';
import adminAiRouter from './modules/admin-ai/admin-ai.route.js';
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
import rakLorongRouter from './modules/rak-lorong/rak-lorong.routes.js';
import scraperRouter from './modules/scraper/scraper.routes.js';
import sopRouter from './modules/sop/sop.route.js';
import expiryRouter from './modules/expiry/expiry.route.js';
import workshopRouter from './modules/workshop/workshop.route.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve frontend static files
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
app.use(cookieParser());

// CORS must be before rate limiter to ensure headers are present on 429 errors
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);

        // Always allow explicitly listed origins
        if (allowedOrigins.includes(origin)) return callback(null, true);

        // Disabling wildcard local network access for production security
        // Access should explicitly come through FRONTEND_URL
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

// Global rate limiter: 300 requests per 15 minutes per IP (production safe)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    message: { status: 'error', message: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/api/csrf-token'
});

// Strict limiter for auth endpoints (anti brute-force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15,
    message: { status: 'error', message: 'Too many authentication attempts, please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// AI/Chat limiter: prevent excessive API cost abuse (60 req/min per IP)
const chatLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60,
    message: { status: 'error', message: 'Too many chat requests, please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

// Query Limiter Protection - ensures no single request asks for > 100 items by default
app.use(queryLimiter({ maxLimit: 100, defaultLimit: 20 }));

// CSRF Protection
const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET || 'your-csrf-secret-key-change-this',
    cookieName: 'x-csrf-token',
    cookieOptions: {
        sameSite: 'strict', // Reverted to strict for security
        path: '/',
        secure: process.env.NODE_ENV === 'production',
    },
    size: 64,
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    getSessionIdentifier: (req) => {
        const id = _optionalChain([(req ), 'access', _ => _.user, 'optionalAccess', _2 => _2.id]) || 'guest';
        // console.log(`[CSRF] getSessionIdentifier: ${id}`);
        return id;
    },
});

// CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
    try {
        console.log('[CSRF] Generating token...');
        const token = generateCsrfToken(req, res);
        console.log('[CSRF] Token generated successfully');
        res.json({ csrfToken: token });
    } catch (error) {
        console.error('[CSRF] Error generating token:', error);
        res.status(500).json({ status: 'error', message: 'Failed to generate CSRF token' });
    }
});

// Apply CSRF protection to all routes except auth and health
app.use((req, res, next) => {
    // Skip CSRF for certain routes
    if (
        req.path.startsWith('/api/auth') ||
        req.path.startsWith('/api/chat') ||
        req.path.startsWith('/api/owner') ||
        req.path.startsWith('/api/facility') ||
        req.path === '/health' ||
        req.path === '/api/csrf-token'
    ) {
        return next();
    }
    return doubleCsrfProtection(req, res, next);
});

// Authentication routes — apply strict rate limiter
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/refresh', authLimiter);
app.use('/api/auth', authRouter);

// User routes
app.use('/api/chat', chatLimiter, chatRouter);
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
app.use('/api/rak-lorong', rakLorongRouter);
app.use('/api/scraper', scraperRouter);
app.use('/api/sop', sopRouter);
app.use('/api/expiry', expiryRouter);
app.use('/api/workshop', workshopRouter);

// Owner routes
app.use('/api', ownerRouter);
app.use('/api/contributor', contributorRouter);

// Admin routes
app.use('/api/admin', adminRouter);
app.use('/api/admin-ai', adminAiRouter);

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// Catch-all route for frontend (must be last)
app.get('*path', (req, res) => {
    // If it's an API route that's not found, don't serve index.html
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: 'API Route Not Found' });
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
});

export default app;
