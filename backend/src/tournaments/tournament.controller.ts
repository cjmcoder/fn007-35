import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TournamentService, CreateTournamentDto, JoinTournamentDto } from './tournament.service';

@ApiTags('Tournaments')
@Controller('tournaments')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tournament' })
  @ApiResponse({ 
    status: 201, 
    description: 'Tournament created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        game: { type: 'string' },
        format: { type: 'string' },
        maxParticipants: { type: 'number' },
        entryFee: { type: 'number' },
        totalPrizePool: { type: 'number' },
        status: { type: 'string' },
        participants: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              username: { type: 'string' },
              avatarUrl: { type: 'string' },
              seed: { type: 'number' },
              status: { type: 'string' },
              joinedAt: { type: 'string', format: 'date-time' }
            }
          }
        },
        brackets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              round: { type: 'number' },
              matches: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    round: { type: 'number' },
                    matchNumber: { type: 'number' },
                    player1Id: { type: 'string' },
                    player2Id: { type: 'string' },
                    status: { type: 'string' }
                  }
                }
              },
              isComplete: { type: 'boolean' }
            }
          }
        },
        createdAt: { type: 'string', format: 'date-time' },
        startsAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  async createTournament(
    @Body() createTournamentDto: CreateTournamentDto,
    @Req() req: any
  ) {
    const userId = req.user?.id || 'demo_user';
    return this.tournamentService.createTournament(createTournamentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tournaments' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of tournaments',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          game: { type: 'string' },
          format: { type: 'string' },
          maxParticipants: { type: 'number' },
          entryFee: { type: 'number' },
          totalPrizePool: { type: 'number' },
          status: { type: 'string' },
          participants: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                userId: { type: 'string' },
                username: { type: 'string' },
                avatarUrl: { type: 'string' },
                seed: { type: 'number' },
                status: { type: 'string' },
                joinedAt: { type: 'string', format: 'date-time' }
              }
            }
          },
          createdAt: { type: 'string', format: 'date-time' },
          startsAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  async getTournaments() {
    return this.tournamentService.getTournaments();
  }

  @Get(':tournamentId')
  @ApiOperation({ summary: 'Get tournament by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tournament details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        game: { type: 'string' },
        format: { type: 'string' },
        maxParticipants: { type: 'number' },
        entryFee: { type: 'number' },
        totalPrizePool: { type: 'number' },
        status: { type: 'string' },
        participants: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              username: { type: 'string' },
              avatarUrl: { type: 'string' },
              seed: { type: 'number' },
              status: { type: 'string' },
              joinedAt: { type: 'string', format: 'date-time' }
            }
          }
        },
        brackets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              round: { type: 'number' },
              matches: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    round: { type: 'number' },
                    matchNumber: { type: 'number' },
                    player1Id: { type: 'string' },
                    player2Id: { type: 'string' },
                    status: { type: 'string' }
                  }
                }
              },
              isComplete: { type: 'boolean' }
            }
          }
        },
        createdAt: { type: 'string', format: 'date-time' },
        startsAt: { type: 'string', format: 'date-time' },
        completedAt: { type: 'string', format: 'date-time' },
        winnerId: { type: 'string' }
      }
    }
  })
  async getTournament(@Param('tournamentId') tournamentId: string) {
    return this.tournamentService.getTournament(tournamentId);
  }

  @Post('join')
  @ApiOperation({ summary: 'Join a tournament' })
  @ApiResponse({ 
    status: 201, 
    description: 'Successfully joined tournament',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        status: { type: 'string' },
        participants: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              username: { type: 'string' },
              seed: { type: 'number' },
              status: { type: 'string' }
            }
          }
        }
      }
    }
  })
  async joinTournament(
    @Body() joinTournamentDto: JoinTournamentDto,
    @Req() req: any
  ) {
    const userId = req.user?.id || 'demo_user';
    return this.tournamentService.joinTournament(userId, joinTournamentDto);
  }

  @Post(':tournamentId/start')
  @ApiOperation({ summary: 'Start a tournament' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tournament started successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        status: { type: 'string' },
        brackets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              round: { type: 'number' },
              matches: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    round: { type: 'number' },
                    matchNumber: { type: 'number' },
                    player1Id: { type: 'string' },
                    player2Id: { type: 'string' },
                    status: { type: 'string' }
                  }
                }
              },
              isComplete: { type: 'boolean' }
            }
          }
        }
      }
    }
  })
  async startTournament(
    @Param('tournamentId') tournamentId: string,
    @Req() req: any
  ) {
    const userId = req.user?.id || 'demo_user';
    return this.tournamentService.startTournament(tournamentId);
  }

  @Get('my-tournaments')
  @ApiOperation({ summary: 'Get user\'s tournaments' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of user\'s tournaments',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          game: { type: 'string' },
          format: { type: 'string' },
          entryFee: { type: 'number' },
          totalPrizePool: { type: 'number' },
          status: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          startsAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  async getUserTournaments(@Req() req: any) {
    const userId = req.user?.id || 'demo_user';
    return this.tournamentService.getUserTournaments(userId);
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get tournament statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tournament statistics',
    schema: {
      type: 'object',
      properties: {
        totalTournaments: { type: 'number' },
        activeTournaments: { type: 'number' },
        completedTournaments: { type: 'number' },
        totalParticipants: { type: 'number' },
        totalPrizePool: { type: 'number' },
        averageEntryFee: { type: 'number' }
      }
    }
  })
  async getTournamentStats() {
    return this.tournamentService.getTournamentStats();
  }

  @Post('fees/calculate')
  @ApiOperation({ summary: 'Calculate tournament entry fee' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tournament fee calculated',
    schema: {
      type: 'object',
      properties: {
        entryFee: { type: 'number' },
        participantCount: { type: 'number' },
        totalEntryFees: { type: 'number' },
        matchFee: { type: 'number' },
        netPrizePool: { type: 'number' },
        feePercentage: { type: 'number' }
      }
    }
  })
  async calculateTournamentFee(@Body() body: { entryFee: number; participantCount: number }) {
    return this.tournamentService.calculateTournamentFee(body.entryFee, body.participantCount);
  }
}





