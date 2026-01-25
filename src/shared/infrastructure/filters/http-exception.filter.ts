import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
    statusCode: number;
    message: string | string[];
    error: string;
    timestamp: string;
    path: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status: number;
        let message: string | string[];
        let error: string;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const responseObj = exceptionResponse as Record<string, unknown>;
                message = (responseObj.message as string | string[]) || exception.message;
                error = (responseObj.error as string) || exception.name;
            } else {
                message = exception.message;
                error = exception.name;
            }
        } else if (exception instanceof Error) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            error = 'Internal Server Error';

            // In production, don't expose internal error messages
            if (process.env.NODE_ENV === 'production') {
                message = 'An unexpected error occurred. Please try again later.';
            } else {
                message = exception.message;
            }

            // Log the full error for debugging
            this.logger.error(
                `Unhandled exception: ${exception.message}`,
                exception.stack,
            );
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            error = 'Internal Server Error';
            message = 'An unexpected error occurred';

            this.logger.error('Unknown exception type', String(exception));
        }

        const errorResponse: ErrorResponse = {
            statusCode: status,
            message,
            error,
            timestamp: new Date().toISOString(),
            path: request.url,
        };

        // Log 5xx errors with more details
        if (status >= 500) {
            this.logger.error(
                `${request.method} ${request.url} - ${status}`,
                {
                    body: this.sanitizeBody(request.body),
                    query: request.query,
                    userId: (request as any).user?.userId,
                },
            );
        }

        response.status(status).json(errorResponse);
    }

    private sanitizeBody(body: unknown): unknown {
        if (!body || typeof body !== 'object') {
            return body;
        }

        const sensitiveFields = ['password', 'token', 'secret', 'authorization', 'apiKey'];
        const sanitized = { ...body as Record<string, unknown> };

        for (const field of sensitiveFields) {
            if (field in sanitized) {
                sanitized[field] = '[REDACTED]';
            }
        }

        return sanitized;
    }
}
