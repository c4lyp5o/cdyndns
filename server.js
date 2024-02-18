import { Server } from 'hyper-express';
import logger from './utils/logger.js';

import { startAllJobs } from './controllers/schedulerMx.js';

// routes
import getip from './routes/getip.js';
import settings from './routes/settings.js';
import jobs from './routes/jobs.js';

const app = new Server();

app.use('/getip', getip);
app.use('/settings', settings);
app.use('/jobs', jobs);

// Start the app
app.listen(process.env.PORT || 5000, () =>
  logger.info(`Server started on port ${process.env.PORT || 5000}`)
);

// Start all jobs
startAllJobs();
