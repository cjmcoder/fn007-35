import { Injectable, Logger, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { KafkaService } from '../../common/kafka/kafka.service';
import { firstValueFrom } from 'rxjs';
import { ReserveServerDto } from './dto/reserve-server.dto';
import { GetServerStatusDto } from './dto/get-server-status.dto';
import { 
  GAME_PRESETS, 
  REGION_TO_LOCATION, 
  READY_DEADLINE_SEC, 
  POLL_INTERVAL_MS,
  TOPIC_SERVER_RESERVED,
  TOPIC_SERVER_READY,
  TOPIC_SERVER_FAILED,
  TOPIC_SERVER_RELEASED,
  ServerState,
  validateServerConfig
} from './config/server.config';

@Injectable()
export class ServerService {
  private readonly logger = new Logger(ServerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly http: HttpService,
    private readonly redis: RedisService,
    private readonly kafka: KafkaService,
  ) {
    // Validate configuration on startup
    validateServerConfig();
  }

  private appHeaders() {
    return {
      Authorization: `Bearer ${process.env.PTERO_APP_API_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  /**
   * Reserve a server for a match with idempotent Pterodactyl integration
   */
  async reserveServer(dto: ReserveServerDto) {
    const { matchId, gameSlug, region } = dto;
    const lockKey = `lock:server:reserve:${matchId}`;
    const got = await this.redis.tryLock(lockKey, 8000);
    
    if (!got) {
      throw new ConflictException('Reservation in progress');
    }

    try {
      // Idempotency: return existing if already reserved/provisioning/ready
      const existing = await this.prisma.client.serverReservation.findUnique({ 
        where: { matchId } 
      });
      
      if (existing && ['PROVISIONING', 'READY'].includes(existing.state)) {
        this.logger.log(`Server already reserved for match ${matchId}`);
        return existing;
      }

      const preset = GAME_PRESETS[gameSlug];
      if (!preset) {
        throw new BadRequestException(`Unsupported gameSlug: ${gameSlug}`);
      }

      // Create DB record (REQUESTED)
      const reservation = await this.prisma.client.serverReservation.upsert({
        where: { matchId },
        create: { 
          matchId, 
          gameSlug, 
          region, 
          state: ServerState.REQUESTED 
        },
        update: { 
          gameSlug, 
          region, 
          state: ServerState.REQUESTED 
        },
      });

      // Create server via Application API
      const locationId = REGION_TO_LOCATION[region];
      if (!locationId) {
        throw new BadRequestException(`Unsupported region: ${region}`);
      }

      // Prepare environment variables with match ID substitution
      const environment = Object.fromEntries(
        Object.entries(preset.environment).map(([k, v]) => [
          k, 
          v.replace('#{MATCH_ID}', matchId)
        ])
      );

      const payload = {
        name: `flock-${gameSlug}-${matchId}`,
        user: 1, // Consider a dedicated "flocknode" owner
        egg: preset.eggId,
        docker_image: preset.dockerImage,
        startup: preset.startup,
        environment,
        limits: preset.limits,
        feature_limits: preset.feature_limits,
        allocation: { 
          default: 0, 
          additional: [] 
        }, // 0 -> auto; else provide an allocation id
        deploy: {
          locations: [locationId],
          dedicated_ip: false,
          port_range: preset.port_range ? [preset.port_range] : [],
        },
        start_on_completion: true,
      };

      this.logger.log(`Creating Pterodactyl server for match ${matchId}`);
      
      const { data } = await firstValueFrom(
        this.http.post(
          `${process.env.PTERO_APP_URL}/api/application/servers`, 
          payload, 
          { headers: this.appHeaders() }
        )
      );

      const panelServerId = data?.attributes?.id;
      const uuid = data?.attributes?.uuid;

      if (!panelServerId) {
        throw new Error('Failed to get server ID from Pterodactyl');
      }

      // Update DB with Pterodactyl server details
      const saved = await this.prisma.client.serverReservation.update({
        where: { id: reservation.id },
        data: { 
          panelServerId, 
          uuid, 
          state: ServerState.PROVISIONING 
        },
      });

      // Update match checklist: serverReserved = PASS
      await this.updateMatchChecklist(matchId, 'serverReserved', 'PASS');
      
      await this.kafka.emit(TOPIC_SERVER_RESERVED, { 
        matchId, 
        panelServerId, 
        region, 
        gameSlug,
        timestamp: new Date().toISOString()
      });

      // Start polling for readiness (fire-and-forget)
      this.pollUntilReady(matchId, panelServerId).catch((error) => {
        this.logger.error(`Polling failed for match ${matchId}:`, error);
      });

      return saved;
    } catch (error) {
      this.logger.error(`Failed to reserve server for match ${matchId}:`, error);
      await this.failReservation(matchId, error);
      throw error;
    } finally {
      await this.redis.releaseLock(lockKey);
    }
  }

  /**
   * Get server status and update checklist
   */
  async getServerStatus(dto: GetServerStatusDto) {
    const res = await this.prisma.client.serverReservation.findUnique({ 
      where: { matchId: dto.matchId }
    });
    
    if (!res?.panelServerId) {
      throw new NotFoundException('Reservation not found');
    }
    
    return this.fetchAndUpdateStatus(res.matchId, res.panelServerId);
  }

  /**
   * Poll server status until ready or timeout
   */
  private async pollUntilReady(matchId: string, panelServerId: number) {
    const deadline = Date.now() + READY_DEADLINE_SEC * 1000;
    
    while (Date.now() < deadline) {
      try {
        const ok = await this.fetchAndUpdateStatus(matchId, panelServerId);
        if (ok) {
          this.logger.log(`Server ready for match ${matchId}`);
          return;
        }
      } catch (error) {
        this.logger.warn(`Status check failed for match ${matchId}:`, error);
      }
      
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
    }
    
    this.logger.error(`Server did not become ready in time for match ${matchId}`);
    throw new Error('Server did not become ready in time');
  }

  /**
   * Fetch server status from Pterodactyl and update checklist
   */
  private async fetchAndUpdateStatus(matchId: string, panelServerId: number): Promise<boolean> {
    try {
      // Get server status from Pterodactyl Application API
      const { data } = await firstValueFrom(
        this.http.get(
          `${process.env.PTERO_APP_URL}/api/application/servers/${panelServerId}`, 
          { headers: this.appHeaders() }
        )
      );
      
      const server = data?.attributes;
      const isInstalled = server?.installed === true;
      const isStarted = server?.suspended === false;

      this.logger.debug(`Server ${panelServerId} status: installed=${isInstalled}, started=${isStarted}`);

      // Update checklist based on server status
      if (isInstalled) {
        await this.updateMatchChecklist(matchId, 'serverReady', 'PASS');
      }

      // Check if both serverReady and adminHooksOk are PASS
      const match = await this.prisma.client.match.findUnique({ 
        where: { id: matchId }
      });
      
      const checklist = match?.checklist as Record<string, 'PENDING' | 'PASS' | 'FAIL'> | null;

      if (checklist?.serverReady === 'PASS' && checklist?.adminHooksOk === 'PASS') {
        await this.prisma.client.serverReservation.update({
          where: { matchId },
          data: { state: ServerState.READY },
        });
        
        await this.kafka.emit(TOPIC_SERVER_READY, { 
          matchId, 
          panelServerId,
          timestamp: new Date().toISOString()
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      this.logger.error(`Failed to fetch server status for match ${matchId}:`, error);
      return false;
    }
  }

  /**
   * Handle server reservation failure
   */
  private async failReservation(matchId: string, error: any) {
    try {
      await this.prisma.client.serverReservation.updateMany({
        where: { matchId },
        data: { state: ServerState.FAILED },
      });
      
      await this.kafka.emit(TOPIC_SERVER_FAILED, { 
        matchId, 
        reason: error?.message || 'unknown',
        timestamp: new Date().toISOString()
      });
      
      this.logger.error(`Server reservation failed for match ${matchId}:`, error);
    } catch (updateError) {
      this.logger.error(`Failed to update reservation failure for match ${matchId}:`, updateError);
    }
  }

  /**
   * Release server after match completion
   */
  async releaseServer(matchId: string) {
    const res = await this.prisma.client.serverReservation.findUnique({ 
      where: { matchId }
    });
    
    if (!res?.panelServerId) {
      this.logger.warn(`No server to release for match ${matchId}`);
      return;
    }

    try {
      await this.prisma.client.serverReservation.update({ 
        where: { matchId }, 
        data: { state: ServerState.RELEASING }
      });

      this.logger.log(`Releasing server ${res.panelServerId} for match ${matchId}`);
      
      // Stop and delete server via Pterodactyl Application API
      await firstValueFrom(
        this.http.delete(
          `${process.env.PTERO_APP_URL}/api/application/servers/${res.panelServerId}`, 
          { headers: this.appHeaders() }
        )
      );

      await this.prisma.client.serverReservation.update({ 
        where: { matchId }, 
        data: { state: ServerState.RELEASED }
      });
      
      await this.kafka.emit(TOPIC_SERVER_RELEASED, { 
        matchId, 
        panelServerId: res.panelServerId,
        timestamp: new Date().toISOString()
      });
      
      this.logger.log(`Server released for match ${matchId}`);
    } catch (error) {
      this.logger.error(`Failed to release server for match ${matchId}:`, error);
      throw error;
    }
  }

  /**
   * Update match checklist (helper method)
   */
  private async updateMatchChecklist(matchId: string, key: string, status: string) {
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
   * Get server reservation details
   */
  async getServerReservation(matchId: string) {
    return this.prisma.client.serverReservation.findUnique({
      where: { matchId }
    });
  }

  /**
   * List active server reservations
   */
  async getActiveReservations() {
    return this.prisma.client.serverReservation.findMany({
      where: {
        state: {
          in: [ServerState.PROVISIONING, ServerState.READY]
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}