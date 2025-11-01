import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { KafkaService } from '../common/kafka/kafka.service';
import axios from 'axios';

@Injectable()
export class ServerProvisionWorker {
  private readonly logger = new Logger(ServerProvisionWorker.name);
  private readonly pterodactylUrl = process.env.PTERODACTYL_URL || 'https://panel.flocknode.com';
  private readonly pterodactylApiKey = process.env.PTERODACTYL_API_KEY;

  constructor(
    private readonly prisma: PrismaService,
    private readonly kafka: KafkaService,
  ) {}

  /**
   * Process server reservation events
   */
  async processServerReserved(event: any): Promise<void> {
    const { matchId, serverId, pterodactylId, gameSlug } = event;

    try {
      this.logger.log(`Processing server reservation for match ${matchId}, server ${serverId}`);

      // Start the server
      await this.startPterodactylServer(pterodactylId);

      // Wait for server to be ready
      await this.waitForServerReady(pterodactylId);

      // Update reservation status
      await this.prisma.serverReservation.update({
        where: { id: serverId },
        data: { status: 'READY' },
      });

      // Update match checklist
      await this.updateChecklist(matchId, 'serverReady', 'PASS');

      this.logger.log(`Server ${serverId} is ready for match ${matchId}`);

      // Emit server ready event
      await this.kafka.emit('server.ready', {
        matchId,
        serverId,
        pterodactylId,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error(`Failed to provision server for match ${matchId}: ${error.message}`);
      
      // Update reservation status to failed
      await this.prisma.serverReservation.update({
        where: { id: serverId },
        data: { status: 'FAILED' },
      });

      // Update match checklist
      await this.updateChecklist(matchId, 'serverReady', 'FAIL');

      // Emit server failed event
      await this.kafka.emit('server.failed', {
        matchId,
        serverId,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Process server release events
   */
  async processServerReleased(event: any): Promise<void> {
    const { matchId, serverId, pterodactylId } = event;

    try {
      this.logger.log(`Processing server release for match ${matchId}, server ${serverId}`);

      // Stop the server
      await this.stopPterodactylServer(pterodactylId);

      // Delete the server
      await this.deletePterodactylServer(pterodactylId);

      this.logger.log(`Server ${serverId} released for match ${matchId}`);

    } catch (error) {
      this.logger.error(`Failed to release server for match ${matchId}: ${error.message}`);
    }
  }

  /**
   * Start Pterodactyl server
   */
  private async startPterodactylServer(serverId: string): Promise<void> {
    await axios.post(
      `${this.pterodactylUrl}/api/client/servers/${serverId}/power`,
      { signal: 'start' },
      {
        headers: {
          'Authorization': `Bearer ${this.pterodactylApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );
  }

  /**
   * Stop Pterodactyl server
   */
  private async stopPterodactylServer(serverId: string): Promise<void> {
    await axios.post(
      `${this.pterodactylUrl}/api/client/servers/${serverId}/power`,
      { signal: 'stop' },
      {
        headers: {
          'Authorization': `Bearer ${this.pterodactylApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );
  }

  /**
   * Delete Pterodactyl server
   */
  private async deletePterodactylServer(serverId: string): Promise<void> {
    await axios.delete(
      `${this.pterodactylUrl}/api/application/servers/${serverId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.pterodactylApiKey}`,
          'Accept': 'application/json',
        },
      }
    );
  }

  /**
   * Wait for server to be ready
   */
  private async waitForServerReady(serverId: string, maxWaitTime = 60000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const response = await axios.get(
          `${this.pterodactylUrl}/api/client/servers/${serverId}/resources`,
          {
            headers: {
              'Authorization': `Bearer ${this.pterodactylApiKey}`,
              'Accept': 'application/json',
            },
          }
        );

        const resources = response.data.attributes;
        
        // Check if server is running and responsive
        if (resources.current_state === 'running' && resources.is_suspended === false) {
          this.logger.log(`Server ${serverId} is ready`);
          return;
        }

        // Wait 5 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 5000));
        
      } catch (error) {
        this.logger.warn(`Server ${serverId} not ready yet: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    throw new Error(`Server ${serverId} did not become ready within ${maxWaitTime}ms`);
  }

  /**
   * Update match checklist
   */
  private async updateChecklist(matchId: string, key: string, value: 'PASS' | 'FAIL' | 'PENDING'): Promise<void> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new Error('Match not found');
    }

    const checklist = JSON.parse(match.checklist || '{}');
    checklist[key] = value;

    await this.prisma.match.update({
      where: { id: matchId },
      data: { checklist: JSON.stringify(checklist) },
    });
  }
}





