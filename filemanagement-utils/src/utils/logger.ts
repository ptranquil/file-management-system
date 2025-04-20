import { createLogger, format, transports } from "winston";
const { combine, timestamp, printf, errors } = format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
});

const infoOnlyFilter = format((info) => {
    return info.level === 'info' ? info : false;
});

const appLogger = createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat
    ),
    transports: [
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({
            filename: 'logs/info.log',
            level: 'info',
            format: format.combine(infoOnlyFilter(), logFormat)
        })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    appLogger.add(
        new transports.Console({
            format: format.combine(format.colorize(), logFormat)
        })
    );
}

export default appLogger;