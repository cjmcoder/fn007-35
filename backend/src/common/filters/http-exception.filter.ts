import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ErrorResponse {
  code: string;
  message: string;
  details?: string;
  timestamp: string;
  path: string;
  requestId?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = request.headers['x-request-id'] as string;

    let status: number;
    let errorResponse: ErrorResponse;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        errorResponse = {
          code: responseObj.code || this.getErrorCode(status),
          message: responseObj.message || exception.message,
          details: responseObj.details,
          timestamp: new Date().toISOString(),
          path: request.url,
          requestId,
        };
      } else {
        errorResponse = {
          code: this.getErrorCode(status),
          message: exception.message,
          timestamp: new Date().toISOString(),
          path: request.url,
          requestId,
        };
      }
    } else {
      // Handle unexpected errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = {
        code: 'ERR_INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? (exception as Error).message : undefined,
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId,
      };

      // Log unexpected errors
      this.logger.error('Unexpected error:', {
        error: exception,
        requestId,
        path: request.url,
        method: request.method,
        userId: (request as any).user?.id,
      });
    }

    // Log all errors
    this.logger.error(`HTTP ${status} Error:`, {
      ...errorResponse,
      method: request.method,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      userId: (request as any).user?.id,
    });

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    const errorCodes: Record<number, string> = {
      400: 'ERR_BAD_REQUEST',
      401: 'ERR_UNAUTHORIZED',
      403: 'ERR_FORBIDDEN',
      404: 'ERR_NOT_FOUND',
      409: 'ERR_CONFLICT',
      422: 'ERR_VALIDATION_FAILED',
      429: 'ERR_TOO_MANY_REQUESTS',
      500: 'ERR_INTERNAL_SERVER_ERROR',
      502: 'ERR_BAD_GATEWAY',
      503: 'ERR_SERVICE_UNAVAILABLE',
      504: 'ERR_GATEWAY_TIMEOUT',
    };

    return errorCodes[status] || 'ERR_UNKNOWN';
  }
}





