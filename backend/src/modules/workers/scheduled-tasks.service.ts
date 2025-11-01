import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StreamHealthWorker } from './stream-health.worker';

@Injectable()
export class ScheduledTasksService {
  private readonly logger = new Logger(ScheduledTasksService.name);

  constructor(
    private readonly streamHealthWorker: StreamHealthWorker,
  ) {}

  /**
   * Run stream health check every 30 seconds
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleStreamHealthCheck() {
    try {
      this.logger.debug('Running scheduled stream health check');
      await this.streamHealthWorker.checkStreamHealth();
    } catch (error) {
      this.logger.error('Error in scheduled stream health check:', error);
    }
  }

  /**
   * Run stream health check every minute (backup)
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleStreamHealthCheckBackup() {
    try {
      this.logger.debug('Running backup stream health check');
      await this.streamHealthWorker.checkStreamHealth();
    } catch (error) {
      this.logger.error('Error in backup stream health check:', error);
    }
  }
}





