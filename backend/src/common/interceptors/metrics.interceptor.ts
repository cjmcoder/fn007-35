import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { register, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly httpRequestsTotal: Counter<string>;
  private readonly httpRequestDuration: Histogram<string>;
  private readonly httpRequestsInFlight: Gauge<string>;

  constructor() {
    // HTTP requests counter
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code', 'user_type'],
      registers: [register],
    });

    // HTTP request duration histogram
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [register],
    });

    // HTTP requests in flight gauge
    this.httpRequestsInFlight = new Gauge({
      name: 'http_requests_in_flight',
      help: 'Number of HTTP requests currently being processed',
      labelNames: ['method', 'route'],
      registers: [register],
    });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    
    const method = request.method;
    const route = this.getRoutePattern(request);
    const userType = this.getUserType(request);
    
    const startTime = Date.now();
    
    // Increment in-flight requests
    this.httpRequestsInFlight.inc({ method, route });

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - startTime) / 1000;
          const statusCode = response.statusCode.toString();
          
          // Record metrics
          this.httpRequestsTotal.inc({ method, route, status_code: statusCode, user_type: userType });
          this.httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
          
          // Decrement in-flight requests
          this.httpRequestsInFlight.dec({ method, route });
        },
        error: (error) => {
          const duration = (Date.now() - startTime) / 1000;
          const statusCode = (error.status || 500).toString();
          
          // Record metrics for errors
          this.httpRequestsTotal.inc({ method, route, status_code: statusCode, user_type: userType });
          this.httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
          
          // Decrement in-flight requests
          this.httpRequestsInFlight.dec({ method, route });
        },
      }),
    );
  }

  private getRoutePattern(request: Request): string {
    // Extract route pattern from request
    const route = request.route?.path || request.path;
    
    // Normalize route patterns (replace IDs with :id)
    return route
      .replace(/\/[a-f0-9-]{36}/g, '/:id') // UUIDs
      .replace(/\/\d+/g, '/:id') // Numeric IDs
      .replace(/\/[a-zA-Z0-9_-]+@[a-zA-Z0-9_.-]+/g, '/:email') // Email addresses
      .replace(/\/[a-zA-Z0-9_-]{3,}/g, '/:slug'); // Other slugs
  }

  private getUserType(request: Request): string {
    const user = (request as any).user;
    if (!user) return 'anonymous';
    
    if (user.roles?.includes('ADMIN')) return 'admin';
    if (user.roles?.includes('MODERATOR')) return 'moderator';
    return 'authenticated';
  }
}





