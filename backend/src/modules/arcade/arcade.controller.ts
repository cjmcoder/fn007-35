import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ArcadeService, CreateMatchDto } from './arcade.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('arcade')
@UseGuards(JwtAuthGuard)
export class ArcadeController {
  constructor(private readonly arcadeService: ArcadeService) {}

  @Post('matches')
  async createMatch(@Body() createMatchDto: CreateMatchDto, @Req() req: any) {
    // Add user ID from JWT token
    createMatchDto.userId = req.user.id;
    
    const match = await this.arcadeService.createMatch(createMatchDto);
    
    return {
      success: true,
      data: match,
      message: 'Match created successfully'
    };
  }

  @Post('matches/:matchId/join')
  async joinMatch(@Param('matchId') matchId: string, @Req() req: any) {
    const match = await this.arcadeService.joinMatch(matchId, req.user.id);
    
    return {
      success: true,
      data: match,
      message: 'Joined match successfully'
    };
  }

  @Post('matches/:matchId/start')
  async startMatch(@Param('matchId') matchId: string) {
    const match = await this.arcadeService.startMatch(matchId);
    
    return {
      success: true,
      data: match,
      message: 'Match started successfully'
    };
  }

  @Post('matches/:matchId/end')
  async endMatch(
    @Param('matchId') matchId: string,
    @Body() body: { winner: string; score?: any }
  ) {
    const match = await this.arcadeService.endMatch(matchId, body.winner, body.score);
    
    return {
      success: true,
      data: match,
      message: 'Match ended successfully'
    };
  }

  @Get('matches/:matchId')
  async getMatch(@Param('matchId') matchId: string) {
    const match = await this.arcadeService.getMatch(matchId);
    
    if (!match) {
      return {
        success: false,
        message: 'Match not found'
      };
    }
    
    return {
      success: true,
      data: match
    };
  }

  @Get('matches')
  async getActiveMatches() {
    const matches = await this.arcadeService.getActiveMatches();
    
    return {
      success: true,
      data: matches,
      count: matches.length
    };
  }

  @Get('matches/user/:userId')
  async getUserMatches(@Param('userId') userId: string) {
    const matches = await this.arcadeService.getUserMatches(userId);
    
    return {
      success: true,
      data: matches,
      count: matches.length
    };
  }

  @Get('games')
  async getAvailableGames() {
    const consoleGames = [
      { id: 'tekken8', name: 'Tekken 8', category: 'Fighting', entryFee: 2, mode: 'console_stream' },
      { id: 'sf6', name: 'Street Fighter 6', category: 'Fighting', entryFee: 2, mode: 'console_stream' },
      { id: 'gt7', name: 'Gran Turismo 7', category: 'Racing', entryFee: 3, mode: 'console_stream' },
      { id: 'fifa24', name: 'FIFA 24', category: 'Sports', entryFee: 2, mode: 'console_stream' },
      { id: 'cod-mw3', name: 'Call of Duty: MW3', category: 'FPS', entryFee: 3, mode: 'console_stream' },
    ];

    const cloudGames = [
      { id: 'tekken5', name: 'Tekken 5 (Emulated)', category: 'Fighting', entryFee: 2, mode: 'cloud_gaming' },
      { id: 'flocknode-drift', name: 'FLOCKNODE Drift', category: 'Racing', entryFee: 2, mode: 'cloud_gaming' },
      { id: 'flocknode-knockout', name: 'FLOCKNODE Knockout', category: 'Fighting', entryFee: 2, mode: 'cloud_gaming' },
      { id: 'flocknode-streetball', name: 'FLOCKNODE Streetball', category: 'Sports', entryFee: 2, mode: 'cloud_gaming' },
    ];

    return {
      success: true,
      data: {
        console_stream: consoleGames,
        cloud_gaming: cloudGames
      }
    };
  }

  @Get('stats')
  async getArcadeStats() {
    const activeMatches = await this.arcadeService.getActiveMatches();
    
    const stats = {
      activeMatches: activeMatches.length,
      waitingMatches: activeMatches.filter(m => m.status === 'waiting').length,
      activeMatches: activeMatches.filter(m => m.status === 'active').length,
      totalPlayers: activeMatches.reduce((sum, match) => sum + match.players.length, 0),
      consoleStreamMatches: activeMatches.filter(m => m.gameMode === 'console_stream').length,
      cloudGamingMatches: activeMatches.filter(m => m.gameMode === 'cloud_gaming').length,
    };

    return {
      success: true,
      data: stats
    };
  }
}
