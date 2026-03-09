import 'dotenv/config';
import app from './app.js';
import { initReminderJob } from './common/jobs/reminder.job.js';
import { initExpiryJob } from './common/jobs/expiry.job.js';

const PORT = process.env.PORT || 4000;

initReminderJob();
initExpiryJob();

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[server]: Server is running at http://0.0.0.0:${PORT}`);
    console.log(`[server]: Internal URL: http://localhost:${PORT}`);
});
