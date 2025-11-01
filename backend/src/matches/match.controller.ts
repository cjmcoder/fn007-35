import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MatchService, CreateMatchDto, JoinMatchDto } from './match.service';

@ApiTags('Matches')
@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new match' })
  @ApiResponse({ 
    status: 201, 
    description: 'Match created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        hostId: { type: 'string' },
        game: { type: 'string' },
        matchType: { type: 'string', enum: ['1v1', 'tournament', 'prop'] },
        entryFee: { type: 'number' },
        totalPrize: { type: 'number' },
        status: { type: 'string', enum: ['waiting', 'active', 'completed', 'cancelled'] },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  async createMatch(
    @Body() createMatchDto: CreateMatchDto,
    @Req() req: any
  ) {
    const userId = req.user?.id || 'demo_user';
    return this.matchService.createMatch(userId, createMatchDto);
  }

  @Post(':matchId/join')
  @ApiOperation({ summary: 'Join an existing match' })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully joined match',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        hostId: { type: 'string' },
        opponentId: { type: 'string' },
        game: { type: 'string' },
        matchType: { type: 'string' },
        entryFee: { type: 'number' },
        totalPrize: { type: 'number' },
        status: { type: 'string' },
        startedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  async joinMatch(
    @Param('matchId') matchId: string,
    @Body() joinMatchDto: JoinMatchDto,
    @Req() req: any
  ) {
    const userId = req.user?.id || 'demo_user';
    return this.matchService.joinMatch(userId, { ...joinMatchDto, matchId });
  }

  @Get()
  @ApiOperation({ summary: 'Get all available matches' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of available matches',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          hostId: { type: 'string' },
          game: { type: 'string' },
          matchType: { type: 'string' },
          entryFee: { type: 'number' },
          totalPrize: { type: 'number' },
          status: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  async getAvailableMatches() {
    return this.matchService.getAvailableMatches();
  }

  @Get('my-matches')
  @ApiOperation({ summary: 'Get user\'s matches' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of user\'s matches',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          hostId: { type: 'string' },
          opponentId: { type: 'string' },
          game: { type: 'string' },
          matchType: { type: 'string' },
          entryFee: { type: 'number' },
          totalPrize: { type: 'number' },
          status: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          startedAt: { type: 'string', format: 'date-time' },
          completedAt: { type: 'string', format: 'date-time' },
          winnerId: { type: 'string' }
        }
      }
    }
  })
  async getUserMatches(@Req() req: any) {
    const userId = req.user?.id || 'demo_user';
    return this.matchService.getUserMatches(userId);
  }

  @Get(':matchId')
  @ApiOperation({ summary: 'Get match by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Match details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        hostId: { type: 'string' },
        opponentId: { type: 'string' },
        game: { type: 'string' },
        matchType: { type: 'string' },
        entryFee: { type: 'number' },
        totalPrize: { type: 'number' },
        status: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        startedAt: { type: 'string', format: 'date-time' },
        completedAt: { type: 'string', format: 'date-time' },
        winnerId: { type: 'string' },
        gameData: { type: 'object' }
      }
    }
  })
  async getMatch(@Param('matchId') matchId: string) {
    return this.matchService.getMatch(matchId);
  }

  @Post(':matchId/complete')
  @ApiOperation({ summary: 'Complete a match' })
  @ApiResponse({ 
    status: 200, 
    description: 'Match completed successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        status: { type: 'string' },
        winnerId: { type: 'string' },
        completedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  async completeMatch(
    @Param('matchId') matchId: string,
    @Body() body: { winnerId: string; gameData?: any },
    @Req() req: any
  ) {
    const userId = req.user?.id || 'demo_user';
    return this.matchService.completeMatch(matchId, body.winnerId, body.gameData);
  }

  @Post(':matchId/cancel')
  @ApiOperation({ summary: 'Cancel a match' })
  @ApiResponse({ 
    status: 200, 
    description: 'Match cancelled successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        status: { type: 'string' },
        completedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  async cancelMatch(
    @Param('matchId') matchId: string,
    @Req() req: any
  ) {
    const userId = req.user?.id || 'demo_user';
    return this.matchService.cancelMatch(matchId, userId);
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get match statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Match statistics',
    schema: {
      type: 'object',
      properties: {
        totalMatches: { type: 'number' },
        activeMatches: { type: 'number' },
        completedMatches: { type: 'number' },
        totalPrizePool: { type: 'number' },
        averageEntryFee: { type: 'number' }
      }
    }
  })
  async getMatchStats() {
    return this.matchService.getMatchStats();
  }

  @Post('fees/calculate')
  @ApiOperation({ summary: 'Calculate match entry fees' })
  @ApiResponse({ 
    status: 200, 
    description: 'Match fees calculated',
    schema: {
      type: 'object',
      properties: {
        totalAmount: { type: 'number' },
        matchFee: { type: 'number' },
        netAmount: { type: 'number' },
        feePercentage: { type: 'number' }
      }
    }
  })
  async calculateMatchFees(@Body() body: { entryFee: number }) {
    return this.matchService.calculateMatchFees(body.entryFee);
  }
}
