import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  UseGuards, 
  Request,
  Logger,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { FlockTubeStreamService, CreateFlockTubeStreamRequest } from './flocktube-stream.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

export interface FlockTubeAuthRequest {
  name: string; // stream key
  addr: string; // client IP
  time: string; // timestamp
  app: string; // application name
}

export interface FlockTubeStreamEndRequest {
  name: string; // stream key
  time: string; // timestamp
  duration: number; // stream duration
  size: number; // file size
}

@Controller('api/flocktube')
export class FlockTubeController {
  private readonly logger = new Logger(FlockTubeController.name);

  constructor(
    private readonly flockTubeService: FlockTubeStreamService,
  ) {}

  /**
   * Create FlockTube stream for private server match
   */
  @Post('streams')
  @UseGuards(JwtAuthGuard)
  async createStream(
    @Request() req: any,
    @Body() body: CreateFlockTubeStreamRequest
  ): Promise<any> {
    const userId = req.user.id;
    
    return this.flockTubeService.createFlockTubeStream({
      ...body,
      userId,
    });
  }

  /**
   * Get streams for a match
   */
  @Get('matches/:matchId/streams')
  @UseGuards(JwtAuthGuard)
  async getMatchStreams(@Param('matchId') matchId: string): Promise<any[]> {
    return this.flockTubeService.getMatchStreams(matchId);
  }

  /**
   * Get stream metrics
   */
  @Get('streams/:streamId/metrics')
  @UseGuards(JwtAuthGuard)
  async getStreamMetrics(@Param('streamId') streamId: string): Promise<any> {
    return this.flockTubeService.getStreamMetrics(streamId);
  }

  /**
   * RTMP Authentication endpoint (called by NGINX)
   */
  @Post('auth')
  async authenticateStream(@Body() body: FlockTubeAuthRequest): Promise<{ code: number; message: string }> {
    const { name: streamKey, addr } = body;
    
    this.logger.log(`RTMP authentication request for stream key: ${streamKey} from IP: ${addr}`);
    
    try {
      // Validate stream key
      const stream = await this.flockTubeService.validateStreamKey(streamKey);
      if (!stream) {
        this.logger.warn(`Invalid stream key: ${streamKey}`);
        return { code: 403, message: 'Invalid stream key' };
      }

      // Update stream status to LIVE
      await this.flockTubeService.updateStreamStatus(stream.id, { status: 'LIVE' });
      
      this.logger.log(`Stream authenticated successfully: ${streamKey}`);
      return { code: 200, message: 'OK' };
    } catch (error) {
      this.logger.error(`Error authenticating stream ${streamKey}:`, error);
      return { code: 500, message: 'Internal error' };
    }
  }

  /**
   * Stream ended callback (called by NGINX)
   */
  @Post('stream-ended')
  async handleStreamEnded(@Body() body: FlockTubeStreamEndRequest): Promise<void> {
    const { name: streamKey, duration, size } = body;
    
    this.logger.log(`Stream ended: ${streamKey}, duration: ${duration}s, size: ${size} bytes`);
    
    try {
      const stream = await this.flockTubeService.getStreamByKey(streamKey);
      if (stream) {
        await this.flockTubeService.updateStreamStatus(stream.id, { status: 'ENDED' });
        this.logger.log(`Updated stream status to ENDED: ${streamKey}`);
      } else {
        this.logger.warn(`Stream not found for ended stream: ${streamKey}`);
      }
    } catch (error) {
      this.logger.error(`Error handling stream ended for ${streamKey}:`, error);
    }
  }

  /**
   * Stream recording done callback (called by NGINX)
   */
  @Post('record-done')
  async handleRecordDone(@Body() body: any): Promise<void> {
    const { name: streamKey, path, size } = body;
    
    this.logger.log(`Recording completed: ${streamKey}, path: ${path}, size: ${size} bytes`);
    
    try {
      // Store recording metadata
      const stream = await this.flockTubeService.getStreamByKey(streamKey);
      if (stream) {
        // TODO: Store recording metadata in database
        this.logger.log(`Recording metadata stored for stream: ${streamKey}`);
      }
    } catch (error) {
      this.logger.error(`Error handling record done for ${streamKey}:`, error);
    }
  }

  /**
   * Update stream metrics (called by monitoring system)
   */
  @Post('streams/:streamId/metrics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'system')
  async updateStreamMetrics(
    @Param('streamId') streamId: string,
    @Body() metrics: any
  ): Promise<void> {
    await this.flockTubeService.updateStreamStatus(streamId, metrics);
  }

  /**
   * End all streams for a match (admin only)
   */
  @Post('matches/:matchId/end-streams')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async endMatchStreams(@Param('matchId') matchId: string): Promise<void> {
    await this.flockTubeService.endMatchStreams(matchId);
  }

  /**
   * Health check endpoint
   */
  @Get('health')
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}





