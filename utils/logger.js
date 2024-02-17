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

      console.log(
        `${'\x1b[37m'}[${dateString} || ${timeString}]\x1b[0m ${color}${level.toUpperCase()}: ${message}\x1b[0m`
      );
    };
  }

  return logger;
}

const logger = createLogger();

export default logger;
