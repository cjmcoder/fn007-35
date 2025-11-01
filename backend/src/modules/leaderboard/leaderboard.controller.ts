import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get(':categoryId')
  async getLeaderboard(
    @Param('categoryId') categoryId: string,
    @Query('limit') limit: number = 100,
    @Query('offset') offset: number = 0
  ) {
    return this.leaderboardService.getLeaderboard(categoryId, limit, offset);
  }

  @Get('user/:userId/stats')
  @UseGuards(JwtAuthGuard)
  async getUserStats(@Param('userId') userId: string) {
    return this.leaderboardService.getUserStats(userId);
  }

  @Post('user/create')
  @UseGuards(JwtAuthGuard)
  async createUserEntry(@Body() createUserDto: {
    userId: string;
    username: string;
    displayName: string;
    initialScore?: number;
    level?: number;
    badges?: string[];
  }) {
    return this.leaderboardService.createUserEntry(createUserDto);
  }

  @Post('user/update')
  @UseGuards(JwtAuthGuard)
  async updateUserScore(@Body() updateScoreDto: {
    userId: string;
    won: boolean;
    score: number;
    gameMode: 'console_stream' | 'cloud_gaming';
    earnings: number;
  }) {
    return this.leaderboardService.updateUserScore(updateScoreDto);
  }

  @Get('categories')
  async getCategories() {
    return this.leaderboardService.getCategories();
  }

  @Get('stats/overview')
  async getOverviewStats() {
    return this.leaderboardService.getOverviewStats();
  }
}
