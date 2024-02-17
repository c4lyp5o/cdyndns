import { Server } from 'hyper-express';
import logger from './utils/logger.js';

// routes
import getip from './routes/getip.js';
import settings from './routes/settings.js';

const app = new Server();

app.use('/getip', getip);
app.use('/settings', settings);

// Start the app
app.listen(process.env.PORT || 5000, () =>
  logger.info(`Server started on port ${process.env.PORT || 5000}`)
);
