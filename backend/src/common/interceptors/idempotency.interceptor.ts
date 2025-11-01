import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RedisService } from '../redis/redis.service';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);

  constructor(private redisService: RedisService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;

    // Only apply idempotency to POST, PUT, PATCH methods
    if (!['POST', 'PUT', 'PATCH'].includes(method)) {
      return next.handle();
    }

    const idempotencyKey = request.headers['idempotency-key'] as string;
    
    if (!idempotencyKey) {
      throw new BadRequestException({
        code: 'ERR_MISSING_IDEMPOTENCY_KEY',
        message: 'Idempotency-Key header is required for this operation',
        details: 'All POST, PUT, and PATCH requests must include an Idempotency-Key header',
      });
    }

    // Validate idempotency key format
    if (!this.isValidIdempotencyKey(idempotencyKey)) {
      throw new BadRequestException({
        code: 'ERR_INVALID_IDEMPOTENCY_KEY',
        message: 'Invalid Idempotency-Key format',
        details: 'Idempotency-Key must be a valid UUID or alphanumeric string (max 128 chars)',
      });
    }

    const userId = (request as any).user?.id || 'anonymous';
    const route = `${method}:${request.route?.path || request.path}`;
    const idempotencyRedisKey = `idempotency:${userId}:${route}:${idempotencyKey}`;

    try {
      // Check if we've already processed this request
      const existingResponse = await this.redisService.get(idempotencyRedisKey);
      
      if (existingResponse) {
        this.logger.debug(`Idempotent request detected: ${idempotencyKey}`, {
          userId,
          route,
          idempotencyKey,
        });
        
        return new Observable(subscriber => {
          try {
            const response = JSON.parse(existingResponse);
            subscriber.next(response);
            subscriber.complete();
          } catch (error) {
            subscriber.error(error);
          }
        });
      }

      // Set idempotency key with 24 hour TTL
      await this.redisService.set(idempotencyRedisKey, 'processing', 86400);

      // Process the request
      return new Observable(subscriber => {
        next.handle().subscribe({
          next: async (response) => {
            try {
              // Store the successful response
              await this.redisService.set(
                idempotencyRedisKey,
                JSON.stringify(response),
                86400, // 24 hours
              );
              
              subscriber.next(response);
              subscriber.complete();
            } catch (error) {
              this.logger.error('Error storing idempotent response:', error);
              subscriber.next(response);
              subscriber.complete();
            }
          },
          error: async (error) => {
            try {
              // Remove the processing flag on error
              await this.redisService.del(idempotencyRedisKey);
            } catch (redisError) {
              this.logger.error('Error cleaning up idempotency key on error:', redisError);
            }
            subscriber.error(error);
          },
        });
      });
    } catch (error) {
      this.logger.error('Idempotency interceptor error:', error);
      throw new BadRequestException({
        code: 'ERR_IDEMPOTENCY_ERROR',
        message: 'Idempotency check failed',
        details: 'Unable to process idempotency check',
      });
    }
  }

  private isValidIdempotencyKey(key: string): boolean {
    // Allow UUIDs or alphanumeric strings up to 128 characters
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const alphanumericRegex = /^[a-zA-Z0-9_-]{1,128}$/;
    
    return uuidRegex.test(key) || alphanumericRegex.test(key);
  }
}





