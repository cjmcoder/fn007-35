import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { KafkaService } from '../common/kafka/kafka.service';
import axios from 'axios';

@Injectable()
export class StreamHealthWorker {
  private readonly logger = new Logger(StreamHealthWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly kafka: KafkaService,
  ) {}

  /**
   * Check stream health for all active VERIFIED_STREAM matches
   */
  async checkStreamHealth(): Promise<void> {
    try {
      // Get all active VERIFIED_STREAM matches
      const activeMatches = await this.prisma.match.findMany({
        where: {
          mode: 'VERIFIED_STREAM',
          state: 'ACTIVE',
        },
        include: {
          host: true,
          opponent: true,
        },
      });

      this.logger.log(`Checking stream health for ${activeMatches.length} active matches`);

      for (const match of activeMatches) {
        await this.checkMatchStreamHealth(match);
      }

    } catch (error) {
      this.logger.error(`Failed to check stream health: ${error.message}`);
    }
  }

  /**
   * Check stream health for a specific match
   */
  private async checkMatchStreamHealth(match: any): Promise<void> {
    try {
      // Get stream pair
      const streamPair = await this.prisma.streamPair.findUnique({
        where: { matchId: match.id },
      });

      if (!streamPair) {
        this.logger.warn(`No stream pair found for match ${match.id}`);
        return;
      }

      let p1Live = false;
      let p2Live = false;
      let p1TitleOk = false;
      let p2TitleOk = false;

      // Check P1 stream
      if (streamPair.p1Provider && streamPair.p1ChannelId) {
        const p1Status = await this.checkStreamStatus(
          streamPair.p1Provider,
          streamPair.p1ChannelId,
          match.id
        );
        p1Live = p1Status.live;
        p1TitleOk = p1Status.titleContainsMatchId;
      }

      // Check P2 stream
      if (streamPair.p2Provider && streamPair.p2ChannelId) {
        const p2Status = await this.checkStreamStatus(
          streamPair.p2Provider,
          streamPair.p2ChannelId,
          match.id
        );
        p2Live = p2Status.live;
        p2TitleOk = p2Status.titleContainsMatchId;
      }

      // Update checklist
      await this.updateChecklist(match.id, 'p1StreamLive', p1Live ? 'PASS' : 'FAIL');
      await this.updateChecklist(match.id, 'p2StreamLive', p2Live ? 'PASS' : 'FAIL');
      await this.updateChecklist(match.id, 'titlesContainMatchId', (p1TitleOk && p2TitleOk) ? 'PASS' : 'FAIL');

      // If either stream is offline, handle accordingly
      if (!p1Live || !p2Live) {
        await this.handleStreamOffline(match, { p1Live, p2Live });
      }

    } catch (error) {
      this.logger.error(`Failed to check stream health for match ${match.id}: ${error.message}`);
    }
  }

  /**
   * Check individual stream status
   */
  private async checkStreamStatus(
    provider: 'TWITCH' | 'YOUTUBE' | 'KICK',
    channelId: string,
    matchId: string
  ): Promise<{
    live: boolean;
    titleContainsMatchId: boolean;
  }> {
    try {
      switch (provider) {
        case 'TWITCH':
          return await this.checkTwitchStream(channelId, matchId);
        case 'YOUTUBE':
          return await this.checkYouTubeStream(channelId, matchId);
        case 'KICK':
          return await this.checkKickStream(channelId, matchId);
        default:
          return { live: false, titleContainsMatchId: false };
      }
    } catch (error) {
      this.logger.error(`Failed to check ${provider} stream ${channelId}: ${error.message}`);
      return { live: false, titleContainsMatchId: false };
    }
  }

  /**
   * Check Twitch stream status
   */
  private async checkTwitchStream(channelId: string, matchId: string): Promise<{
    live: boolean;
    titleContainsMatchId: boolean;
  }> {
    // TODO: Implement Twitch API integration
    // For now, return mock data
    return {
      live: true,
      titleContainsMatchId: true,
    };
  }

  /**
   * Check YouTube stream status
   */
  private async checkYouTubeStream(channelId: string, matchId: string): Promise<{
    live: boolean;
    titleContainsMatchId: boolean;
  }> {
    // TODO: Implement YouTube API integration
    // For now, return mock data
    return {
      live: true,
      titleContainsMatchId: true,
    };
  }

  /**
   * Check Kick stream status
   */
  private async checkKickStream(channelId: string, matchId: string): Promise<{
    live: boolean;
    titleContainsMatchId: boolean;
  }> {
    // TODO: Implement Kick API integration
    // For now, return mock data
    return {
      live: true,
      titleContainsMatchId: true,
    };
  }

  /**
   * Handle stream going offline
   */
  private async handleStreamOffline(match: any, streamStatus: { p1Live: boolean; p2Live: boolean }): Promise<void> {
    const { p1Live, p2Live } = streamStatus;

    // If both streams are offline, auto-forfeit
    if (!p1Live && !p2Live) {
      this.logger.warn(`Both streams offline for match ${match.id}, auto-forfeiting`);
      
      await this.kafka.emit('match.auto_forfeit', {
        matchId: match.id,
        reason: 'Both streams offline',
        timestamp: new Date().toISOString(),
      });
    } else {
      // One stream offline - create dispute
      this.logger.warn(`Stream offline for match ${match.id}, creating dispute`);
      
      await this.kafka.emit('match.stream_dispute', {
        matchId: match.id,
        p1Live,
        p2Live,
        reason: 'Stream offline during match',
        timestamp: new Date().toISOString(),
      });
    }
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





