import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { initializeSocket } from "./socket.js";
import { initReminderJob } from "./common/jobs/reminder.job.js";
import { initExpiryJob } from "./common/jobs/expiry.job.js";

const PORT = process.env.PORT || 4000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow no-origin requests and local network IPs
      if (!origin) return callback(null, true);
      const localNet =
        /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/;
      if (
        localNet.test(origin) ||
        origin === (process.env.FRONTEND_URL || "")
      ) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  },
});

initializeSocket(io);
initReminderJob();
initExpiryJob();

httpServer.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`[server]: Server is running at http://0.0.0.0:${PORT}`);
  console.log(`[server]: Internal URL: http://localhost:${PORT}`);
});
