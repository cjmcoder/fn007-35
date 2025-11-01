import { Injectable, Logger, ConflictException, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { KafkaService } from '../../common/kafka/kafka.service';
import { firstValueFrom } from 'rxjs';

const READY_DEADLINE_MS = 5 * 60_000; // 5 minutes
const POLL_EVERY_MS = 4_000; // 4 seconds

interface ServerReservedEvent {
  v: string;
  eventId: string;
  matchId: string;
  panelServerId: number;
}

interface ServerReleasedEvent {
  v: string;
  eventId: string;
  matchId: string;
  panelServerId: number;
}

@Injectable()
export class ServerProvisionWorker {
  private readonly logger = new Logger(ServerProvisionWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly kafka: KafkaService,
    private readonly http: HttpService,
  ) {}

  /**
   * Process server reserved event - poll for readiness
   */
  async processServerReserved(payload: ServerReservedEvent) {
    const { v, eventId, matchId, panelServerId } = payload;
    
    this.logger.log(`Processing server reserved event for match ${matchId}`);
    
    await this.assertIdempotency('srv:reserved', eventId);

    const reservation = await this.prisma.client.serverReservation.findUnique({ 
      where: { matchId } 
    });
    
    if (!reservation?.panelServerId) {
      throw new BadRequestException('Reservation missing or invalid');
    }

    // Start polling for readiness
    const deadline = Date.now() + READY_DEADLINE_MS;
    let attempts = 0;
    
    while (Date.now() < deadline) {
      attempts++;
      this.logger.debug(`Readiness check attempt ${attempts} for match ${matchId}`);
      
      const isReady = await this.checkReadiness(matchId, reservation.panelServerId);
      
      if (isReady) {
        await this.kafka.emit('server.ready', {
          v: 'v1',
          matchId,
          panelServerId: reservation.panelServerId,
          timestamp: Date.now()
        });
        
        await this.markIdempotent('srv:reserved', eventId);
        this.logger.log(`Server ready for match ${matchId} after ${attempts} attempts`);
        return;
      }
      
      await this.sleep(POLL_EVERY_MS);
    }

    // Timeout - fail reservation and cancel match
    this.logger.error(`Server readiness timeout for match ${matchId} after ${attempts} attempts`);
    await this.failReservation(matchId, 'timeout');
    await this.markIdempotent('srv:reserved', eventId);
  }

  /**
   * Process server released event - cleanup resources
   */
  async processServerReleased(payload: ServerReleasedEvent) {
    const { v, eventId, matchId, panelServerId } = payload;
    
    this.logger.log(`Processing server released event for match ${matchId}`);
    
    await this.assertIdempotency('srv:released', eventId);

    const reservation = await this.prisma.client.serverReservation.findUnique({ 
      where: { matchId } 
    });
    
    if (!reservation?.panelServerId) {
      this.logger.warn(`No reservation found for match ${matchId} during release`);
      await this.markIdempotent('srv:released', eventId);
      return;
    }

    try {
      // Delete server via Pterodactyl Application API
      await this.deletePanelServer(reservation.panelServerId);
      
      // Update reservation state
      await this.prisma.client.serverReservation.update({
        where: { matchId },
        data: { state: 'RELEASED' },
      });

      await this.kafka.emit('server.released', {
        v: 'v1',
        matchId,
        panelServerId: reservation.panelServerId,
        timestamp: Date.now()
      });
      
      this.logger.log(`Server released for match ${matchId}`);
    } catch (error) {
      this.logger.error(`Failed to release server for match ${matchId}:`, error);
      // Continue with cleanup even if Pterodactyl deletion fails
    }
    
    await this.markIdempotent('srv:released', eventId);
  }

  /**
   * Check if server is ready (installed + admin hooks OK)
   */
  private async checkReadiness(matchId: string, panelServerId: number): Promise<boolean> {
    try {
      // Check if server is installed via Pterodactyl API
      const isInstalled = await this.isPanelInstalled(panelServerId);
      
      if (isInstalled) {
        await this.updateMatchChecklist(matchId, 'serverReady', 'PASS');
      }

      // Check if admin hooks are OK (set by HMAC admin hook endpoint)
      const match = await this.prisma.client.match.findUnique({ 
        where: { id: matchId },
        select: { checklist: true }
      });
      
      const checklist = match?.checklist as any;
      const adminHooksOk = checklist?.adminHooksOk === 'PASS';
      
      // Server is ready when both conditions are met
      const isReady = isInstalled && adminHooksOk;
      
      if (isReady) {
        await this.prisma.client.serverReservation.update({
          where: { matchId },
          data: { state: 'READY' }
        });
        
        // Also mark overlay as connected if it's running in the container
        await this.updateMatchChecklist(matchId, 'overlayConnected', 'PASS');
      }
      
      return isReady;
    } catch (error) {
      this.logger.error(`Error checking readiness for match ${matchId}:`, error);
      return false;
    }
  }

  /**
   * Check if Pterodactyl server is installed
   */
  private async isPanelInstalled(panelServerId: number): Promise<boolean> {
    try {
      const headers = {
        Authorization: `Bearer ${process.env.PTERO_APP_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      const { data } = await firstValueFrom(
        this.http.get(
          `${process.env.PTERO_APP_URL}/api/application/servers/${panelServerId}`,
          { headers }
        )
      );

      const server = data?.attributes;
      return server?.installed === true;
    } catch (error) {
      this.logger.error(`Failed to check panel installation for server ${panelServerId}:`, error);
      return false;
    }
  }

  /**
   * Delete Pterodactyl server
   */
  private async deletePanelServer(panelServerId: number): Promise<void> {
    try {
      const headers = {
        Authorization: `Bearer ${process.env.PTERO_APP_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      await firstValueFrom(
        this.http.delete(
          `${process.env.PTERO_APP_URL}/api/application/servers/${panelServerId}`,
          { headers }
        )
      );
      
      this.logger.log(`Successfully deleted Pterodactyl server ${panelServerId}`);
    } catch (error) {
      this.logger.error(`Failed to delete Pterodactyl server ${panelServerId}:`, error);
      throw error;
    }
  }

  /**
   * Handle reservation failure
   */
  private async failReservation(matchId: string, reason: string): Promise<void> {
    try {
      // Update reservation state
      await this.prisma.client.serverReservation.updateMany({
        where: { matchId },
        data: { state: 'FAILED' }
      });

      // Emit failure event
      await this.kafka.emit('server.failed', {
        v: 'v1',
        matchId,
        reason,
        timestamp: Date.now()
      });

      // Cancel match and refund (business policy)
      await this.cancelMatchAndRefund(matchId, 'server_issue');
      
      this.logger.error(`Reservation failed for match ${matchId}: ${reason}`);
    } catch (error) {
      this.logger.error(`Error handling reservation failure for match ${matchId}:`, error);
    }
  }

  /**
   * Cancel match and refund both players
   */
  private async cancelMatchAndRefund(matchId: string, reason: string): Promise<void> {
    try {
      // Update match state
      await this.prisma.client.match.update({
        where: { id: matchId },
        data: { 
          state: 'CANCELLED',
          completeAt: new Date()
        }
      });

      // Emit cancellation event
      await this.kafka.emit('match.cancelled', {
        v: 'v1',
        matchId,
        reason,
        timestamp: Date.now()
      });

      // Refund both players (this would call the wallet service)
      await this.kafka.emit('wallet.refund', {
        v: 'v1',
        matchId,
        timestamp: Date.now()
      });
      
      this.logger.log(`Match cancelled and refunded for ${matchId}: ${reason}`);
    } catch (error) {
      this.logger.error(`Error cancelling match ${matchId}:`, error);
    }
  }

  /**
   * Update match checklist
   */
  private async updateMatchChecklist(matchId: string, key: string, status: string): Promise<void> {
    try {
      await this.prisma.client.$executeRawUnsafe(`
        UPDATE "matches"
        SET checklist = jsonb_set(checklist::jsonb, '{${key}}', '"${status}"', true)
        WHERE id = $1
      `, matchId);
    } catch (error) {
      this.logger.error(`Failed to update checklist for match ${matchId}:`, error);
    }
  }

  /**
   * Assert idempotency for event processing
   */
  private async assertIdempotency(bucket: string, eventId: string): Promise<void> {
    const key = `wk:idemp:${bucket}:${eventId}`;
    const isNew = await this.redis.set(key, '1', 'NX', 'PX', 86_400_000); // 24 hours
    
    if (!isNew) {
      throw new ConflictException(`Duplicate event: ${bucket}:${eventId}`);
    }
  }

  /**
   * Mark event as processed (idempotency)
   */
  private async markIdempotent(bucket: string, eventId: string): Promise<void> {
    // Event is already marked as processed in assertIdempotency
    // This is a no-op for consistency with the interface
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}





