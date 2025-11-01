import { Controller, Post, Get, Body, Param, Headers, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { ServerService } from './server.service';
import { ReserveServerDto } from './dto/reserve-server.dto';
import { GetServerStatusDto } from './dto/get-server-status.dto';
import { AdminHookDto } from './dto/admin-hook.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as crypto from 'crypto';

@ApiTags('Server')
@Controller('server')
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @Post('reserve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reserve a server for a match' })
  @ApiResponse({ status: 201, description: 'Server reserved successfully' })
  async reserveServer(
    @Request() req,
    @Body() dto: ReserveServerDto,
    @Headers('Idempotency-Key') idempotencyKey?: string
  ) {
    return this.serverService.reserveServer({
      ...dto,
      idempotencyKey: idempotencyKey || dto.idempotencyKey
    });
  }

  @Get('status/:matchId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get server status for a match' })
  @ApiResponse({ status: 200, description: 'Server status retrieved' })
  async getServerStatus(@Param('matchId') matchId: string) {
    return this.serverService.getServerStatus({ matchId });
  }

  @Post('release/:matchId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Release server after match completion' })
  @ApiResponse({ status: 200, description: 'Server released successfully' })
  async releaseServer(@Param('matchId') matchId: string) {
    return this.serverService.releaseServer(matchId);
  }

  @Get('reservation/:matchId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get server reservation details' })
  @ApiResponse({ status: 200, description: 'Reservation details retrieved' })
  async getServerReservation(@Param('matchId') matchId: string) {
    return this.serverService.getServerReservation(matchId);
  }

  @Get('active')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all active server reservations' })
  @ApiResponse({ status: 200, description: 'Active reservations retrieved' })
  async getActiveReservations() {
    return this.serverService.getActiveReservations();
  }

  /**
   * Admin hook endpoint for HMAC-verified server status updates
   * This is called by game containers when they're ready
   */
  @Post('admin-hook/:matchId')
  @ApiOperation({ summary: 'Admin hook for server status (HMAC verified)' })
  @ApiHeader({ name: 'x-flock-signature', description: 'HMAC signature' })
  @ApiResponse({ status: 200, description: 'Admin hook processed' })
  async adminHook(
    @Param('matchId') matchId: string,
    @Headers('x-flock-signature') signature: string,
    @Body() body: AdminHookDto
  ) {
    // Verify HMAC signature
    const secret = process.env.ADMIN_HOOK_SECRET;
    if (!secret) {
      throw new ForbiddenException('Admin hook secret not configured');
    }

    const payload = JSON.stringify(body);
    const computed = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (computed !== signature) {
      throw new ForbiddenException('Invalid HMAC signature');
    }

    // Optional: Check timestamp freshness (±30 seconds)
    const now = Math.floor(Date.now() / 1000);
    const timeDiff = Math.abs(now - body.ts);
    if (timeDiff > 30) {
      throw new ForbiddenException('Request timestamp too old');
    }

    // Update match checklist: adminHooksOk = PASS
    await this.serverService.updateMatchChecklist(matchId, 'adminHooksOk', 'PASS');

    return { 
      ok: true, 
      matchId, 
      status: body.status,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Health check endpoint for server containers
   */
  @Post('health/:matchId')
  @ApiOperation({ summary: 'Server health check endpoint' })
  @ApiResponse({ status: 200, description: 'Health check processed' })
  async healthCheck(
    @Param('matchId') matchId: string,
    @Body() body: { status: string; players?: number; uptime?: number }
  ) {
    // This could be used for additional server monitoring
    // For now, just log the health status
    console.log(`Health check for match ${matchId}:`, body);
    
    return { 
      ok: true, 
      matchId, 
      timestamp: new Date().toISOString()
    };
  }
}