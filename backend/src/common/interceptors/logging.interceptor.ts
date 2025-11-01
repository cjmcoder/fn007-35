import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const requestId = headers['x-request-id'] as string || this.generateRequestId();
    const userId = (request as any).user?.id;

    const startTime = Date.now();

    // Add request ID to response headers
    response.setHeader('X-Request-ID', requestId);

    this.logger.log(`📥 ${method} ${url}`, {
      requestId,
      userId,
      ip,
      userAgent: userAgent.substring(0, 100), // Truncate long user agents
      timestamp: new Date().toISOString(),
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;
          
          this.logger.log(`📤 ${method} ${url} ${statusCode} - ${duration}ms`, {
            requestId,
            userId,
            statusCode,
            duration,
            responseSize: JSON.stringify(data).length,
            timestamp: new Date().toISOString(),
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;
          
          this.logger.error(`❌ ${method} ${url} ${statusCode} - ${duration}ms`, {
            requestId,
            userId,
            statusCode,
            duration,
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
          });
        },
      }),
    );
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}





