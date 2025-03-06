import { join } from 'path';
import { addColors, format as _format, transports as _transports, createLogger } from 'winston';
import 'winston-daily-rotate-file';
import parsers from './parsers.js';
const { redactFormat, redactMessage, debugTraverse, jsonTruncateFormat } = parsers;

const logDir = join(__dirname, '..', 'logs');

const { NODE_ENV, DEBUG_LOGGING = true, DEBUG_CONSOLE = false, CONSOLE_JSON = false } = process.env;

const useConsoleJson =
  (typeof CONSOLE_JSON === 'string' && CONSOLE_JSON?.toLowerCase() === 'true') ||
  CONSOLE_JSON === true;

const useDebugConsole =
  (typeof DEBUG_CONSOLE === 'string' && DEBUG_CONSOLE?.toLowerCase() === 'true') ||
  DEBUG_CONSOLE === true;

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
  redactFormat(),
  _format.timestamp({ format: () => new Date().toISOString() }),
  _format.errors({ stack: true }),
  _format.splat(),
  // redactErrors(),
);

const transports = [
  new _transports.DailyRotateFile({
    level: 'error',
    filename: `${logDir}/error-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: fileFormat,
  }),
  // new winston.transports.DailyRotateFile({
  //   level: 'info',
  //   filename: `${logDir}/info-%DATE%.log`,
  //   datePattern: 'YYYY-MM-DD',
  //   zippedArchive: true,
  //   maxSize: '20m',
  //   maxFiles: '14d',
  // }),
];

// if (NODE_ENV !== 'production') {
//   transports.push(
//     new winston.transports.Console({
//       format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
//     }),
//   );
// }

if (
  (typeof DEBUG_LOGGING === 'string' && DEBUG_LOGGING?.toLowerCase() === 'true') ||
  DEBUG_LOGGING === true
) {
  transports.push(
    new _transports.DailyRotateFile({
      level: 'debug',
      filename: `${logDir}/debug-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: _format.combine(fileFormat, debugTraverse),
    }),
  );
}

const consoleFormat = _format.combine(
  redactFormat(),
  _format.colorize({ all: true }),
  _format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  // redactErrors(),
  _format.printf((info) => {
    const message = `${info.timestamp} ${info.level}: ${info.message}`;
    if (info.level.includes('error')) {
      return redactMessage(message);
    }

    return message;
  }),
);

if (useDebugConsole) {
  transports.push(
    new _transports.Console({
      level: 'debug',
      format: useConsoleJson
        ? _format.combine(fileFormat, jsonTruncateFormat(), _format.json())
        : _format.combine(fileFormat, debugTraverse),
    }),
  );
} else if (useConsoleJson) {
  transports.push(
    new _transports.Console({
      level: 'info',
      format: _format.combine(fileFormat, jsonTruncateFormat(), _format.json()),
    }),
  );
} else {
  transports.push(
    new _transports.Console({
      level: 'info',
      format: consoleFormat,
    }),
  );
}

const logger = createLogger({
  level: level(),
  levels,
  transports,
});

export default logger;
