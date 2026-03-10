function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { doubleCsrf } from 'csrf-csrf';
import cookieParser from 'cookie-parser';
import { queryLimiter } from './common/middleware/query-limiter.middleware.js';
import { sseService } from './common/services/sse.service.js';

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

// Trust proxy for express-rate-limit (Nginx reverse proxy)
app.set('trust proxy', 1);

// Relaxed Security for Development/SSE
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", "http://103.183.74.207", "http://103.183.74.207", "http://103.183.74.207", "http://103.183.74.207", "https://accounts.google.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:", "*.googleusercontent.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://accounts.google.com"],
            frameSrc: ["'self'", "https://accounts.google.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
        },
    },
}));



// Serve frontend static files
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
app.use(cookieParser());

// CORS must be before rate limiter to ensure headers are present on 429 errors
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://103.183.74.207',
    'http://103.183.74.207',
    'http://103.183.74.207',
    'http://103.183.74.207',
];

app.use(cors({
    origin: true,
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
        const id = _optionalChain([(req), 'access', _ => _.user, 'optionalAccess', _2 => _2.id]) || 'guest';
        // console.log(`[CSRF] getSessionIdentifier: ${id}`);
        return id;
    },
});

// Create API Router
const apiRouter = express.Router();

// Health Check (Moved into /api)
apiRouter.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// Serve static files from uploads folder (Moved under /api)
apiRouter.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// CSRF token endpoint
apiRouter.get('/csrf-token', (req, res) => {
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

// SSE endpoint
apiRouter.get('/events', (req, res) => {
    // Explicitly set headers for SSE and CORS before passing to service
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    sseService.addClient(req, res);
});

// SSE join-room endpoint (Replacement for socket.join)
apiRouter.post('/join-room', (req, res) => {
    const { clientId, roomName } = req.body;
    if (!clientId || !roomName) {
        return res.status(400).json({ status: 'error', message: 'clientId and roomName are required' });
    }
    sseService.joinRoom(clientId, roomName);
    res.json({ status: 'success', message: `Joined room ${roomName}` });
});

// Apply CSRF protection to all routes except specific ones
apiRouter.use((req, res, next) => {
    // Skip CSRF for certain routes (relative to /api)
    const path = req.path;
    if (
        path.startsWith('/auth') ||
        path.startsWith('/chat') ||
        path.startsWith('/owner') ||
        path.startsWith('/facility') ||
        path === '/health' ||
        path === '/csrf-token' ||
        path === '/events' ||
        path === '/join-room'
    ) {
        return next();
    }
    return doubleCsrfProtection(req, res, next);
});

// Authentication routes — apply strict rate limiter
apiRouter.use('/auth/login', authLimiter);
apiRouter.use('/auth/register', authLimiter);
apiRouter.use('/auth/refresh', authLimiter);
apiRouter.use('/auth', authRouter);

// User routes
apiRouter.use('/chat', chatLimiter, chatRouter);
apiRouter.use('/rating', ratingRouter);
apiRouter.use('/reminder', reminderRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/shopping-list', shoppingListRouter);
apiRouter.use('/print', printRouter);
apiRouter.use('/weather', weatherRouter);
apiRouter.use('/facility', facilityRouter);
apiRouter.use('/vacancies', vacancyRouter);
apiRouter.use('/rewards', rewardRouter);
apiRouter.use('/buildings', buildingRouter);
apiRouter.use('/stats', statRouter);

// POS Routes
apiRouter.use('/pos/members', memberRouter);
apiRouter.use('/pos/transactions', transactionRouter);
apiRouter.use('/pos/reports', reportRouter);
apiRouter.use('/pos/rewards', rewardRouter);
apiRouter.use('/pos/health', healthRouter);
apiRouter.use('/pos/settings', posSettingsRouter);
apiRouter.use('/rak-lorong', rakLorongRouter);
apiRouter.use('/scraper', scraperRouter);
apiRouter.use('/sop', sopRouter);
apiRouter.use('/expiry', expiryRouter);
apiRouter.use('/workshop', workshopRouter);

// Contributor routes
apiRouter.use('/contributor', contributorRouter);

// Admin routes
apiRouter.use('/admin', adminRouter);
apiRouter.use('/admin-ai', adminAiRouter);

// Owner routes (Last because it has more generic mounts)
apiRouter.use('/', ownerRouter);

// Mount all API routes under /api
app.use('/api', apiRouter);

// Catch-all route for frontend (must be last)
app.get('*path', (req, res) => {
    // If it's an API route that's not found, don't serve index.html
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: 'API Route Not Found' });
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
});

export default app;
