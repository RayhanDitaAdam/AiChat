import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { initializeSocket } from './socket.js';
import { initReminderJob } from './common/jobs/reminder.job.js';
import { initExpiryJob } from './common/jobs/expiry.job.js';
const PORT = process.env.PORT || 4000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true
    }
});
initializeSocket(io);
initReminderJob();
initExpiryJob();
httpServer.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[server]: Server is running at http://0.0.0.0:${PORT}`);
    console.log(`[server]: Internal URL: http://localhost:${PORT}`);
});
//# sourceMappingURL=main.js.map