import { Controller, Post, Get, Body, Param, Headers, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { OverlayService } from './overlay.service';
import { OverlayEventDto } from './dto/overlay-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Overlay')
@Controller('overlay')
export class OverlayController {
  constructor(private readonly overlayService: OverlayService) {}

  /**
   * Main endpoint for overlay events with HMAC verification
   */
  @Post('event')
  @ApiOperation({ summary: 'Process overlay event (HMAC verified)' })
  @ApiHeader({ name: 'x-flock-key-id', description: 'Per-match key identifier' })
  @ApiHeader({ name: 'x-flock-ts', description: 'Unix timestamp in milliseconds' })
  @ApiHeader({ name: 'x-flock-nonce', description: 'Unique nonce for replay protection' })
  @ApiHeader({ name: 'x-flock-signature', description: 'HMAC-SHA256 signature' })
  @ApiResponse({ status: 200, description: 'Event processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 403, description: 'Authentication failed' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async processEvent(
    @Request() req,
    @Body() body: OverlayEventDto
  ) {
    return this.overlayService.processEvent(req, body);
  }

  /**
   * Get current score for a match (public endpoint)
   */
  @Get('score/:matchId')
  @ApiOperation({ summary: 'Get current match score' })
  @ApiResponse({ status: 200, description: 'Score retrieved' })
  async getMatchScore(@Param('matchId') matchId: string) {
    const score = await this.overlayService.getMatchScore(matchId);
    return { matchId, score, timestamp: Date.now() };
  }

  /**
   * Get last heartbeat for a match (admin only)
   */
  @Get('heartbeat/:matchId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get last heartbeat timestamp (admin only)' })
  @ApiResponse({ status: 200, description: 'Heartbeat retrieved' })
  async getLastHeartbeat(@Param('matchId') matchId: string) {
    const timestamp = await this.overlayService.getLastHeartbeat(matchId);
    return { matchId, lastHeartbeat: timestamp, timestamp: Date.now() };
  }

  /**
   * Generate overlay secrets for a match (admin only)
   */
  @Post('secrets/:matchId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generate overlay secrets for match (admin only)' })
  @ApiResponse({ status: 201, description: 'Secrets generated' })
  async generateSecrets(@Param('matchId') matchId: string) {
    const secrets = await this.overlayService.generateMatchSecrets(matchId);
    return { matchId, ...secrets, timestamp: Date.now() };
  }

  /**
   * Revoke overlay secrets for a match (admin only)
   */
  @Post('secrets/:matchId/revoke')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Revoke overlay secrets for match (admin only)' })
  @ApiResponse({ status: 200, description: 'Secrets revoked' })
  async revokeSecrets(@Param('matchId') matchId: string) {
    await this.overlayService.revokeMatchSecrets(matchId);
    return { matchId, revoked: true, timestamp: Date.now() };
  }

  /**
   * Health check endpoint
   */
  @Get('health')
  @ApiOperation({ summary: 'Overlay service health check' })
  @ApiResponse({ status: 200, description: 'Service healthy' })
  async healthCheck() {
    return {
      status: 'healthy',
      service: 'overlay',
      timestamp: Date.now(),
      version: '1.0.0'
    };
  }

  /**
   * Test endpoint for signature verification (development only)
   */
  @Post('test/signature')
  @ApiOperation({ summary: 'Test signature verification (development only)' })
  @ApiResponse({ status: 200, description: 'Signature test completed' })
  async testSignature(
    @Request() req,
    @Body() body: any
  ) {
    if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException('Test endpoint not available in production');
    }

    try {
      const result = await this.overlayService.processEvent(req, body);
      return { success: true, result };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        code: error.constructor.name
      };
    }
  }
}