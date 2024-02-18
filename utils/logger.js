import fs from 'fs';
import path from 'path';

const levels = {
  error: '\x1b[31m', // Red
  warn: '\x1b[33m', // Yellow
  info: '\x1b[36m', // Cyan
  debug: '\x1b[32m', // Green
};

function createLogger() {
  const logger = {};

  for (const level in levels) {
    logger[level] = (message) => {
      const date = new Date();
      const dateString = date.toLocaleDateString();
      const timeString = date.toLocaleTimeString();
      const color = levels[level];

      const logMessage = `${'\x1b[37m'}[${dateString} || ${timeString}]\x1b[0m ${color}${level.toUpperCase()}: ${message}\x1b[0m`;
      const logMessageToFile = `[${dateString} || ${timeString}] ${level.toUpperCase()}: ${message}\n`;

      console.log(logMessage);

      if (!fs.existsSync(path.join(process.cwd(), 'logs'))) {
        fs.mkdirSync('logs');
      }

      fs.appendFile(
        path.join(process.cwd(), 'logs', 'app.log'),
        logMessageToFile,
        (err) => {
          if (err) {
            console.error(`Failed to write to log file: ${err.message}`);
          }
        }
      );
    };
  }

  return logger;
}

const logger = createLogger();

export default logger;
