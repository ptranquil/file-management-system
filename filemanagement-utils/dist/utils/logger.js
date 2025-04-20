"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const { combine, timestamp, printf, errors } = winston_1.format;
const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
});
const infoOnlyFilter = (0, winston_1.format)((info) => {
    return info.level === 'info' ? info : false;
});
const appLogger = (0, winston_1.createLogger)({
    level: 'info',
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), logFormat),
    transports: [
        new winston_1.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston_1.transports.File({
            filename: 'logs/info.log',
            level: 'info',
            format: winston_1.format.combine(infoOnlyFilter(), logFormat)
        })
    ]
});
if (process.env.NODE_ENV !== 'production') {
    appLogger.add(new winston_1.transports.Console({
        format: winston_1.format.combine(winston_1.format.colorize(), logFormat)
    }));
}
exports.default = appLogger;
