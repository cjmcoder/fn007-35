import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('database.url'),
        },
      },
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    });

    // Log database queries in development
    if (configService.get<string>('nodeEnv') === 'development') {
      // this.$on('query', (e) => {
      //   this.logger.debug(`Query: ${e.query}`);
      //   this.logger.debug(`Params: ${e.params}`);
      //   this.logger.debug(`Duration: ${e.duration}ms`);
      // });
    }

    // this.$on('error', (e) => {
    //   this.logger.error('Database error:', e);
    // });

    // this.$on('info', (e) => {
    //   this.logger.log(`Database info: ${e.message}`);
    // });

    // this.$on('warn', (e) => {
    //   this.logger.warn(`Database warning: ${e.message}`);
    // });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Connected to CockroachDB');
    } catch (error) {
      this.logger.error('❌ Failed to connect to CockroachDB:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('🔌 Disconnected from CockroachDB');
  }

  /**
   * Execute a transaction with automatic retry on conflict
   */
  async executeTransaction<T>(
    fn: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>) => Promise<T>,
    maxRetries = 3,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.$transaction(fn, {
          maxWait: 5000, // 5 seconds
          timeout: 10000, // 10 seconds
        });
      } catch (error) {
        lastError = error as Error;
        
        // Check if it's a retryable error
        if (this.isRetryableError(error) && attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          this.logger.warn(`Transaction attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw error;
      }
    }

    throw lastError;
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: any): boolean {
    const retryableErrors = [
      'P2034', // Transaction conflict
      'P2024', // Connection timeout
      'P2025', // Operation timeout
    ];

    return retryableErrors.some(code => error.code === code);
  }

  /**
   * Health check for database connection
   */
  async healthCheck(): Promise<{ status: string; latency: number }> {
    const start = Date.now();
    try {
      await this.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;
      return { status: 'healthy', latency };
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return { status: 'unhealthy', latency: Date.now() - start };
    }
  }
}
