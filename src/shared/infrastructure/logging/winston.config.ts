import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, context, trace, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    const traceStr = trace ? `\n${trace}` : '';
    const contextStr = context ? `[${context}] ` : '';
    return `${timestamp} ${level}: ${contextStr}${message}${metaStr}${traceStr}`;
});

// Custom format for JSON output (production)
const jsonFormat = printf(({ level, message, timestamp, context, trace, ...meta }) => {
    return JSON.stringify({
        timestamp,
        level,
        context,
        message,
        trace,
        ...meta,
    });
});

export const winstonConfig = (): WinstonModuleOptions => {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
        transports: [
            // Console transport
            new winston.transports.Console({
                level: isProduction ? 'info' : 'debug',
                format: combine(
                    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                    errors({ stack: true }),
                    isProduction ? jsonFormat : combine(colorize(), consoleFormat),
                ),
            }),

            // File transport for errors (production only)
            ...(isProduction ? [
                new winston.transports.File({
                    filename: 'logs/error.log',
                    level: 'error',
                    format: combine(
                        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                        errors({ stack: true }),
                        jsonFormat,
                    ),
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                }),
                new winston.transports.File({
                    filename: 'logs/combined.log',
                    format: combine(
                        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                        errors({ stack: true }),
                        jsonFormat,
                    ),
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                }),
            ] : []),
        ],
    };
};
