import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { KafkaService } from '../../common/kafka/kafka.service';
import axios from 'axios';

export interface LinkStreamRequest {
  matchId: string;
  side: 'p1' | 'p2';
  provider: 'TWITCH' | 'YOUTUBE' | 'KICK';
  channelId: string;
}

export interface CheckStreamRequest {
  matchId: string;
}

@Injectable()
export class StreamService {
  private readonly logger = new Logger(StreamService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly kafka: KafkaService,
  ) {}

  /**
   * Link stream for VERIFIED_STREAM mode
   */
  async linkStream(userId: string, request: LinkStreamRequest): Promise<{
    status: string;
    provider: string;
    channelId: string;
    streamUrl: string;
  }> {
    const { matchId, side, provider, channelId } = request;

    // Get match
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.mode !== 'VERIFIED_STREAM') {
      throw new BadRequestException('Stream linking only available for VERIFIED_STREAM mode');
    }

    if (![match.hostId, match.oppId].includes(userId)) {
      throw new BadRequestException('You are not part of this match');
    }

    // Determine if this is P1 (host) or P2 (opponent)
    const isP1 = userId === match.hostId;
    const actualSide = isP1 ? 'p1' : 'p2';

    if (side !== actualSide) {
      throw new BadRequestException(`You can only link ${actualSide} stream`);
    }

    // Generate stream URL
    const streamUrl = this.generateStreamUrl(provider, channelId);

    // Update or create StreamPair
    await this.prisma.streamPair.upsert({
      where: { matchId },
      update: {
        [`${side}Provider`]: provider,
        [`${side}ChannelId`]: channelId,
        [`${side}StreamUrl`]: streamUrl,
      },
      create: {
        matchId,
        [`${side}Provider`]: provider,
        [`${side}ChannelId`]: channelId,
        [`${side}StreamUrl`]: streamUrl,
      },
    });

    // Update match checklist
    await this.updateChecklist(matchId, 'streamsLinked', 'PASS');

    // Emit Kafka event
    await this.kafka.emit('stream.linked', {
      matchId,
      userId,
      side,
      provider,
      channelId,
      streamUrl,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`User ${userId} linked ${provider} stream ${channelId} for match ${matchId}`);

    return {
      status: 'linked',
      provider,
      channelId,
      streamUrl,
    };
  }

  /**
   * Check stream status and update checklist
   */
  async checkStream(request: CheckStreamRequest): Promise<{
    live: boolean;
    streamsLinked: boolean;
    p1StreamLive: boolean;
    p2StreamLive: boolean;
    titlesContainMatchId: boolean;
    bitrateOk: boolean;
    fpsOk: boolean;
  }> {
    const { matchId } = request;

    // Get match
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.mode !== 'VERIFIED_STREAM') {
      throw new BadRequestException('Stream checking only available for VERIFIED_STREAM mode');
    }

    // Get stream pair
    const streamPair = await this.prisma.streamPair.findUnique({
      where: { matchId },
    });

    if (!streamPair) {
      throw new BadRequestException('No streams linked for this match');
    }

    const results = {
      live: false,
      streamsLinked: true,
      p1StreamLive: false,
      p2StreamLive: false,
      titlesContainMatchId: false,
      bitrateOk: false,
      fpsOk: false,
    };

    // Check P1 stream
    if (streamPair.p1Provider && streamPair.p1ChannelId) {
      const p1Status = await this.checkStreamStatus(
        streamPair.p1Provider,
        streamPair.p1ChannelId,
        matchId,
      );
      results.p1StreamLive = p1Status.live;
      results.titlesContainMatchId = p1Status.titleContainsMatchId;
      results.bitrateOk = p1Status.bitrateOk;
      results.fpsOk = p1Status.fpsOk;
    }

    // Check P2 stream
    if (streamPair.p2Provider && streamPair.p2ChannelId) {
      const p2Status = await this.checkStreamStatus(
        streamPair.p2Provider,
        streamPair.p2ChannelId,
        matchId,
      );
      results.p2StreamLive = p2Status.live;
      results.titlesContainMatchId = results.titlesContainMatchId && p2Status.titleContainsMatchId;
      results.bitrateOk = results.bitrateOk && p2Status.bitrateOk;
      results.fpsOk = results.fpsOk && p2Status.fpsOk;
    }

    results.live = results.p1StreamLive && results.p2StreamLive;

    // Update checklist
    await this.updateChecklist(matchId, 'p1StreamLive', results.p1StreamLive ? 'PASS' : 'FAIL');
    await this.updateChecklist(matchId, 'p2StreamLive', results.p2StreamLive ? 'PASS' : 'FAIL');
    await this.updateChecklist(matchId, 'titlesContainMatchId', results.titlesContainMatchId ? 'PASS' : 'FAIL');
    await this.updateChecklist(matchId, 'bitrateOk', results.bitrateOk ? 'PASS' : 'FAIL');
    await this.updateChecklist(matchId, 'fpsOk', results.fpsOk ? 'PASS' : 'FAIL');

    // Emit Kafka event
    await this.kafka.emit('stream.checked', {
      matchId,
      results,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Checked streams for match ${matchId}: ${JSON.stringify(results)}`);

    return results;
  }

  /**
   * Check individual stream status
   */
  private async checkStreamStatus(
    provider: 'TWITCH' | 'YOUTUBE' | 'KICK',
    channelId: string,
    matchId: string,
  ): Promise<{
    live: boolean;
    titleContainsMatchId: boolean;
    bitrateOk: boolean;
    fpsOk: boolean;
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
          throw new BadRequestException(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      this.logger.error(`Failed to check ${provider} stream ${channelId}: ${error.message}`);
      return {
        live: false,
        titleContainsMatchId: false,
        bitrateOk: false,
        fpsOk: false,
      };
    }
  }

  /**
   * Check Twitch stream status
   */
  private async checkTwitchStream(channelId: string, matchId: string): Promise<{
    live: boolean;
    titleContainsMatchId: boolean;
    bitrateOk: boolean;
    fpsOk: boolean;
  }> {
    // TODO: Implement Twitch API integration
    // For now, return mock data
    return {
      live: true,
      titleContainsMatchId: true,
      bitrateOk: true,
      fpsOk: true,
    };
  }

  /**
   * Check YouTube stream status
   */
  private async checkYouTubeStream(channelId: string, matchId: string): Promise<{
    live: boolean;
    titleContainsMatchId: boolean;
    bitrateOk: boolean;
    fpsOk: boolean;
  }> {
    // TODO: Implement YouTube API integration
    // For now, return mock data
    return {
      live: true,
      titleContainsMatchId: true,
      bitrateOk: true,
      fpsOk: true,
    };
  }

  /**
   * Check Kick stream status
   */
  private async checkKickStream(channelId: string, matchId: string): Promise<{
    live: boolean;
    titleContainsMatchId: boolean;
    bitrateOk: boolean;
    fpsOk: boolean;
  }> {
    // TODO: Implement Kick API integration
    // For now, return mock data
    return {
      live: true,
      titleContainsMatchId: true,
      bitrateOk: true,
      fpsOk: true,
    };
  }

  /**
   * Generate stream URL
   */
  private generateStreamUrl(provider: 'TWITCH' | 'YOUTUBE' | 'KICK', channelId: string): string {
    switch (provider) {
      case 'TWITCH':
        return `https://www.twitch.tv/${channelId}`;
      case 'YOUTUBE':
        return `https://www.youtube.com/channel/${channelId}`;
      case 'KICK':
        return `https://kick.com/${channelId}`;
      default:
        throw new BadRequestException(`Unsupported provider: ${provider}`);
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
      throw new NotFoundException('Match not found');
    }

    const checklist = JSON.parse(match.checklist || '{}');
    checklist[key] = value;

    await this.prisma.match.update({
      where: { id: matchId },
      data: { checklist: JSON.stringify(checklist) },
    });
  }
}





