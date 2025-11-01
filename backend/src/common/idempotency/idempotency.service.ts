import { Injectable, BadRequestException } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import * as crypto from 'crypto';

@Injectable()
export class IdempotencyService {
  constructor(private readonly redisService: RedisService) {}

  async execute<T>(
    idempotencyKey: string,
    operationKey: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required');
    }

    const key = `idemp:${operationKey}:${crypto.createHash('sha256').update(idempotencyKey).digest('hex')}`;
    const lockKey = `${key}:lock`;

    // Check if we already have a result for this operation
    const existingResult = await this.redisService.get(key);
    if (existingResult) {
      return JSON.parse(existingResult);
    }

    // Try to acquire a lock to prevent concurrent execution
    const lock = await this.redisService.set(lockKey, 'locked', 'EX', 30);
    if (!lock) {
      // Wait a bit and check again for the result
      await new Promise(resolve => setTimeout(resolve, 100));
      const retryResult = await this.redisService.get(key);
      if (retryResult) {
        return JSON.parse(retryResult);
      }
      throw new BadRequestException('Operation in progress, please try again');
    }

    try {
      // Execute the operation
      const result = await operation();

      // Store the result for future idempotent requests
      await this.redisService.set(key, JSON.stringify(result), 'EX', 86400); // 24 hours

      return result;
    } catch (error) {
      // Don't cache errors, let them be retried
      throw error;
    } finally {
      // Release the lock
      await this.redisService.del(lockKey);
    }
  }
}
