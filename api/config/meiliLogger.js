import { join } from 'path';
import { addColors, format as _format, transports as _transports, createLogger } from 'winston';
import 'winston-daily-rotate-file';

const logDir = join(__dirname, '..', 'logs');

const { NODE_ENV } = process.env;

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  activity: 6,
  silly: 7,
};

addColors({
  info: 'green', // fontStyle color
  warn: 'italic yellow',
  error: 'red',
  debug: 'blue',
});

const level = () => {
  const env = NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

const fileFormat = _format.combine(
  _format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  _format.errors({ stack: true }),
  _format.splat(),
);

const transports = [
  new _transports.DailyRotateFile({
    level: 'debug',
    filename: `${logDir}/meiliSync-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: fileFormat,
  }),
];

// if (NODE_ENV !== 'production') {
//   transports.push(
//     new winston.transports.Console({
//       format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
//     }),
//   );
// }

const consoleFormat = _format.combine(
  _format.colorize({ all: true }),
  _format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  _format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
);

transports.push(
  new _transports.Console({
    level: 'info',
    format: consoleFormat,
  }),
);

const logger = createLogger({
  level: level(),
  levels,
  transports,
});

export default logger;
