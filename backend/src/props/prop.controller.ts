import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PropService, CreatePropDto, PlaceWagerDto } from './prop.service';

@ApiTags('Props')
@Controller('props')
export class PropController {
  constructor(private readonly propService: PropService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new prop bet' })
  @ApiResponse({ 
    status: 201, 
    description: 'Prop bet created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string' },
        game: { type: 'string' },
        options: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              odds: { type: 'number' },
              totalWagered: { type: 'number' },
              wagerCount: { type: 'number' }
            }
          }
        },
        status: { type: 'string' },
        totalWagered: { type: 'number' },
        houseVig: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        closesAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  async createProp(
    @Body() createPropDto: CreatePropDto,
    @Req() req: any
  ) {
    const userId = req.user?.id || 'demo_user';
    return this.propService.createProp(createPropDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all open prop bets' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of open prop bets',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          game: { type: 'string' },
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                odds: { type: 'number' },
                totalWagered: { type: 'number' },
                wagerCount: { type: 'number' }
              }
            }
          },
          status: { type: 'string' },
          totalWagered: { type: 'number' },
          houseVig: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
          closesAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  async getOpenProps() {
    return this.propService.getOpenProps();
  }

  @Get(':propId')
  @ApiOperation({ summary: 'Get prop bet by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Prop bet details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string' },
        game: { type: 'string' },
        options: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              odds: { type: 'number' },
              totalWagered: { type: 'number' },
              wagerCount: { type: 'number' }
            }
          }
        },
        status: { type: 'string' },
        totalWagered: { type: 'number' },
        houseVig: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        closesAt: { type: 'string', format: 'date-time' },
        settledAt: { type: 'string', format: 'date-time' },
        winningOptionId: { type: 'string' }
      }
    }
  })
  async getProp(@Param('propId') propId: string) {
    return this.propService.getProp(propId);
  }

  @Post('wager')
  @ApiOperation({ summary: 'Place a wager on a prop bet' })
  @ApiResponse({ 
    status: 201, 
    description: 'Wager placed successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        propId: { type: 'string' },
        optionId: { type: 'string' },
        amount: { type: 'number' },
        potentialPayout: { type: 'number' },
        status: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  async placeWager(
    @Body() placeWagerDto: PlaceWagerDto,
    @Req() req: any
  ) {
    const userId = req.user?.id || 'demo_user';
    return this.propService.placeWager(userId, placeWagerDto);
  }

  @Get('my-wagers')
  @ApiOperation({ summary: 'Get user\'s wagers' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of user\'s wagers',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          propId: { type: 'string' },
          optionId: { type: 'string' },
          amount: { type: 'number' },
          potentialPayout: { type: 'number' },
          status: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          settledAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  async getUserWagers(@Req() req: any) {
    const userId = req.user?.id || 'demo_user';
    return this.propService.getUserWagers(userId);
  }

  @Post(':propId/settle')
  @ApiOperation({ summary: 'Settle a prop bet' })
  @ApiResponse({ 
    status: 200, 
    description: 'Prop bet settled successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        status: { type: 'string' },
        winningOptionId: { type: 'string' },
        settledAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  async settleProp(
    @Param('propId') propId: string,
    @Body() body: { winningOptionId: string },
    @Req() req: any
  ) {
    const userId = req.user?.id || 'demo_user';
    return this.propService.settleProp(propId, body.winningOptionId);
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get prop betting statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Prop betting statistics',
    schema: {
      type: 'object',
      properties: {
        totalProps: { type: 'number' },
        openProps: { type: 'number' },
        settledProps: { type: 'number' },
        totalWagered: { type: 'number' },
        totalHouseVig: { type: 'number' },
        averageWager: { type: 'number' }
      }
    }
  })
  async getPropStats() {
    return this.propService.getPropStats();
  }

  @Post('fees/calculate')
  @ApiOperation({ summary: 'Calculate prop bet house vig' })
  @ApiResponse({ 
    status: 200, 
    description: 'Prop vig calculated',
    schema: {
      type: 'object',
      properties: {
        wagerAmount: { type: 'number' },
        vigAmount: { type: 'number' },
        netPayout: { type: 'number' },
        vigPercentage: { type: 'number' }
      }
    }
  })
  async calculatePropVig(@Body() body: { wagerAmount: number }) {
    return this.propService.calculatePropVig(body.wagerAmount);
  }
}





