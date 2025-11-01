import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client!: RedisClientType;

  async getClient(): Promise<RedisClientType> {
    if (!this.client) {
      this.client = createClient({ url: process.env.REDIS_URL });
      this.client.on('error', (e) => console.error('[redis] error', e));
      await this.client.connect();
    }
    return this.client;
  }

  async onModuleDestroy() {
    if (this.client) await this.client.quit();
  }
}

