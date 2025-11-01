import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ServerProvisionWorker } from './server-provision.worker';
import { StreamHealthWorker } from './stream-health.worker';

@Injectable()
export class WorkersKafkaConsumers {
  private readonly logger = new Logger(WorkersKafkaConsumers.name);

  constructor(
    private readonly serverProvisionWorker: ServerProvisionWorker,
    private readonly streamHealthWorker: StreamHealthWorker,
  ) {}

  /**
   * Handle server reserved events
   */
  @EventPattern('server.reserved')
  async handleServerReserved(@Payload() payload: any) {
    try {
      this.logger.log(`Processing server.reserved event: ${JSON.stringify(payload)}`);
      await this.serverProvisionWorker.processServerReserved(payload);
    } catch (error) {
      this.logger.error('Error processing server.reserved event:', error);
      // In production, you might want to send to a dead letter queue
    }
  }

  /**
   * Handle server released events
   */
  @EventPattern('server.released')
  async handleServerReleased(@Payload() payload: any) {
    try {
      this.logger.log(`Processing server.released event: ${JSON.stringify(payload)}`);
      await this.serverProvisionWorker.processServerReleased(payload);
    } catch (error) {
      this.logger.error('Error processing server.released event:', error);
    }
  }

  /**
   * Handle stream health check trigger
   */
  @EventPattern('stream.health.check')
  async handleStreamHealthCheck(@Payload() payload: any) {
    try {
      this.logger.debug('Processing stream.health.check event');
      await this.streamHealthWorker.checkStreamHealth();
    } catch (error) {
      this.logger.error('Error processing stream.health.check event:', error);
    }
  }

  /**
   * Handle match started events to begin stream monitoring
   */
  @EventPattern('match.started')
  async handleMatchStarted(@Payload() payload: any) {
    try {
      this.logger.log(`Match started, beginning stream monitoring: ${payload.matchId}`);
      // Start periodic stream health checks for this match
      // This could trigger a scheduled task or add to a monitoring queue
    } catch (error) {
      this.logger.error('Error handling match.started event:', error);
    }
  }

  /**
   * Handle match completed events to stop stream monitoring
   */
  @EventPattern('match.completed')
  async handleMatchCompleted(@Payload() payload: any) {
    try {
      this.logger.log(`Match completed, stopping stream monitoring: ${payload.matchId}`);
      // Stop stream monitoring for this match
    } catch (error) {
      this.logger.error('Error handling match.completed event:', error);
    }
  }
}





