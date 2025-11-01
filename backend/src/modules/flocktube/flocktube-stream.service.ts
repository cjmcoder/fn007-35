import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { KafkaService } from '../../common/kafka/kafka.service';
import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';

export interface CreateFlockTubeStreamRequest {
  matchId: string;
  userId: string;
  side: 'p1' | 'p2';
}

export interface FlockTubeStreamResponse {
  streamId: string;
  streamKey: string;
  rtmpUrl: string;
  hlsUrl: string;
  dashUrl: string;
  title: string;
}

export interface StreamMetrics {
  bitrate?: number;
  fps?: number;
  resolution?: string;
  viewerCount?: number;
  status: 'PENDING' | 'LIVE' | 'ENDED' | 'ERROR';
}

@Injectable()
export class FlockTubeStreamService {
  private readonly logger = new Logger(FlockTubeStreamService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly kafka: KafkaService,
  ) {}

  /**
   * Create FlockTube stream for private server match
   */
  async createFlockTubeStream(
    request: CreateFlockTubeStreamRequest
  ): Promise<FlockTubeStreamResponse> {
    const { matchId, userId, side } = request;

    // Validate match exists and is in correct mode
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      select: { 
        id: true, 
        mode: true, 
        hostId: true, 
        oppId: true,
        state: true 
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.mode !== 'PRIVATE_SERVER_WITH_STREAM') {
      throw new BadRequestException('FlockTube streams only available for PRIVATE_SERVER_WITH_STREAM mode');
    }

    // Validate user is part of the match
    if (![match.hostId, match.oppId].includes(userId)) {
      throw new BadRequestException('User is not part of this match');
    }

    // Check if stream already exists
    const existingStream = await this.prisma.flocktubeStream.findFirst({
      where: { matchId, userId, side },
    });

    if (existingStream) {
      throw new BadRequestException('Stream already exists for this user and side');
    }

    // Generate unique stream key
    const streamKey = this.generateStreamKey(matchId, side);
    
    // Create stream record
    const stream = await this.prisma.flocktubeStream.create({
      data: {
        matchId,
        userId,
        side,
        streamKey,
        rtmpUrl: `${process.env.FLOCKTUBE_RTMP_URL}/${streamKey}`,
        hlsUrl: `${process.env.FLOCKTUBE_HLS_URL}/${streamKey}/index.m3u8`,
        dashUrl: `${process.env.FLOCKTUBE_DASH_URL}/${streamKey}/index.mpd`,
        status: 'PENDING',
        title: `FLOCKNODE Match #${matchId} - ${side.toUpperCase()}`,
      },
    });

    // Update match checklist
    await this.updateChecklist(matchId, 'flocktubeStreamsLinked', 'PASS');

    // Emit Kafka event
    await this.kafka.emit('flocktube.stream.created', {
      matchId,
      userId,
      side,
      streamId: stream.id,
      streamKey,
      rtmpUrl: stream.rtmpUrl,
      hlsUrl: stream.hlsUrl,
      dashUrl: stream.dashUrl,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Created FlockTube stream for match ${matchId}, user ${userId}, side ${side}`);

    return {
      streamId: stream.id,
      streamKey: stream.streamKey,
      rtmpUrl: stream.rtmpUrl,
      hlsUrl: stream.hlsUrl,
      dashUrl: stream.dashUrl,
      title: stream.title,
    };
  }

  /**
   * Update stream status and metrics
   */
  async updateStreamStatus(
    streamId: string,
    metrics: StreamMetrics
  ): Promise<void> {
    const stream = await this.prisma.flocktubeStream.findUnique({
      where: { id: streamId },
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    // Update stream record
    await this.prisma.flocktubeStream.update({
      where: { id: streamId },
      data: {
        status: metrics.status,
        bitrate: metrics.bitrate,
        fps: metrics.fps,
        resolution: metrics.resolution,
        viewerCount: metrics.viewerCount,
        updatedAt: new Date(),
      },
    });

    // Update match checklist based on status
    const checklistKey = stream.side === 'p1' ? 'p1FlocktubeLive' : 'p2FlocktubeLive';
    const checklistValue = metrics.status === 'LIVE' ? 'PASS' : 'FAIL';
    await this.updateChecklist(stream.matchId, checklistKey, checklistValue);

    // Update quality metrics in checklist
    if (metrics.status === 'LIVE') {
      await this.updateChecklist(stream.matchId, 'flocktubeBitrateOk', 
        (metrics.bitrate && metrics.bitrate >= 2500) ? 'PASS' : 'FAIL');
      await this.updateChecklist(stream.matchId, 'flocktubeFpsOk', 
        (metrics.fps && metrics.fps >= 30) ? 'PASS' : 'FAIL');
    }

    // Emit Kafka event
    await this.kafka.emit('flocktube.stream.updated', {
      matchId: stream.matchId,
      streamId,
      side: stream.side,
      status: metrics.status,
      metrics,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Updated FlockTube stream ${streamId} status to ${metrics.status}`);
  }

  /**
   * Get stream by stream key (for authentication)
   */
  async getStreamByKey(streamKey: string): Promise<any> {
    return this.prisma.flocktubeStream.findUnique({
      where: { streamKey },
      include: {
        match: {
          select: {
            id: true,
            mode: true,
            state: true,
            hostId: true,
            oppId: true,
          },
        },
      },
    });
  }

  /**
   * Validate stream key for authentication
   */
  async validateStreamKey(streamKey: string): Promise<any> {
    const stream = await this.getStreamByKey(streamKey);
    
    if (!stream) {
      return null;
    }

    // Check if match is still active
    if (!['READY_CHECK', 'ACTIVE'].includes(stream.match.state)) {
      this.logger.warn(`Stream key ${streamKey} used for inactive match ${stream.matchId}`);
      return null;
    }

    return stream;
  }

  /**
   * Get active streams for a match
   */
  async getMatchStreams(matchId: string): Promise<any[]> {
    return this.prisma.flocktubeStream.findMany({
      where: { matchId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { side: 'asc' },
    });
  }

  /**
   * Get stream metrics for monitoring
   */
  async getStreamMetrics(streamId: string): Promise<StreamMetrics> {
    const stream = await this.prisma.flocktubeStream.findUnique({
      where: { id: streamId },
      select: {
        status: true,
        bitrate: true,
        fps: true,
        resolution: true,
        viewerCount: true,
      },
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    return {
      status: stream.status as any,
      bitrate: stream.bitrate,
      fps: stream.fps,
      resolution: stream.resolution,
      viewerCount: stream.viewerCount,
    };
  }

  /**
   * End all streams for a match
   */
  async endMatchStreams(matchId: string): Promise<void> {
    const streams = await this.prisma.flocktubeStream.findMany({
      where: { 
        matchId,
        status: { in: ['PENDING', 'LIVE'] }
      },
    });

    for (const stream of streams) {
      await this.updateStreamStatus(stream.id, { status: 'ENDED' });
    }

    this.logger.log(`Ended ${streams.length} streams for match ${matchId}`);
  }

  /**
   * Generate unique stream key
   */
  private generateStreamKey(matchId: string, side: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `flocktube_${matchId}_${side}_${timestamp}_${random}`;
  }

  /**
   * Update match checklist
   */
  private async updateChecklist(matchId: string, key: string, value: 'PASS' | 'FAIL' | 'PENDING'): Promise<void> {
    try {
      const match = await this.prisma.match.findUnique({
        where: { id: matchId },
        select: { checklist: true },
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
    } catch (error) {
      this.logger.error(`Failed to update checklist for match ${matchId}:`, error);
    }
  }
}





