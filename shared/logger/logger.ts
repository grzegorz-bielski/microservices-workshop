import * as winston from 'winston';
import { Logger } from './logger.types';

const logFormat = winston.format.printf(({ level, message, meta, stack }) => {
  if (meta && meta.stack) {
    stack = meta.stack;
  }

  return JSON.stringify({
    '@timestamp': new Date().toISOString(),
    '@version': 1,
    application: process.env.APP_NAME,
    environment: process.env.NODE_ENV,
    host: process.env.HOST,
    message,
    stack,
    severity: level,
    type: 'stdin',
  });
});

export const winstonLogger: Logger = winston.createLogger({
  level: process.env.LOGGING_LEVEL || 'debug',
  format: winston.format.combine(winston.format.splat(), logFormat),
  transports: [new winston.transports.Console()],
});
