import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import { KafkaService } from '../common/kafka/kafka.service';

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
  dependencies?: {
    database: { status: string; latency: number };
    redis: { status: string; latency: number };
    kafka: { status: string; latency: number };
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
    private redisService: RedisService,
    private kafkaService: KafkaService,
  ) {}

  async getBasicHealth(): Promise<HealthStatus> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: this.configService.get<string>('version', '1.0.0'),
    };
  }

  async getDetailedHealth(): Promise<HealthStatus> {
    const [databaseHealth, redisHealth, kafkaHealth] = await Promise.allSettled([
      this.prismaService.healthCheck(),
      this.redisService.healthCheck(),
      this.kafkaService.healthCheck(),
    ]);

    const dependencies = {
      database: {
        status: databaseHealth.status === 'fulfilled' ? databaseHealth.value.status : 'unhealthy',
        latency: databaseHealth.status === 'fulfilled' ? databaseHealth.value.latency : -1,
      },
      redis: {
        status: redisHealth.status === 'fulfilled' ? redisHealth.value.status : 'unhealthy',
        latency: redisHealth.status === 'fulfilled' ? redisHealth.value.latency : -1,
      },
      kafka: {
        status: kafkaHealth.status === 'fulfilled' ? kafkaHealth.value.status : 'unhealthy',
        latency: kafkaHealth.status === 'fulfilled' ? kafkaHealth.value.latency : -1,
      },
    };

    const overallStatus = Object.values(dependencies).every(
      dep => dep.status === 'healthy'
    ) ? 'ok' : 'error';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: this.configService.get<string>('version', '1.0.0'),
      dependencies,
    };
  }

  async getReadiness(): Promise<{ status: string; timestamp: string }> {
    try {
      // Check if all critical dependencies are ready
      const [databaseHealth, redisHealth] = await Promise.all([
        this.prismaService.healthCheck(),
        this.redisService.healthCheck(),
      ]);

      const isReady = databaseHealth.status === 'healthy' && redisHealth.status === 'healthy';

      return {
        status: isReady ? 'ready' : 'not ready',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Readiness check failed:', error);
      return {
        status: 'not ready',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getLiveness(): Promise<{ status: string; timestamp: string }> {
    // Liveness check is simple - if the service is responding, it's alive
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}





