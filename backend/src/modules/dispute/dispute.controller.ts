import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DisputeService } from './dispute.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

export class OpenDisputeDto {
  matchId: string;
  reason: string;
  notes?: string;
}

export class ResolveDisputeDto {
  matchId: string;
  outcome: 'PAYOUT' | 'REFUND' | 'VOID';
  winnerId?: string;
}

@ApiTags('Dispute')
@Controller('dispute')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post('open')
  @ApiOperation({ summary: 'Open a dispute' })
  @ApiResponse({ status: 201, description: 'Dispute opened successfully' })
  async openDispute(@Request() req, @Body() openDisputeDto: OpenDisputeDto) {
    return this.disputeService.openDispute(req.user.id, openDisputeDto);
  }

  @Post('resolve')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Resolve a dispute (admin only)' })
  @ApiResponse({ status: 200, description: 'Dispute resolved successfully' })
  async resolveDispute(@Request() req, @Body() resolveDisputeDto: ResolveDisputeDto) {
    return this.disputeService.resolveDispute(req.user.id, resolveDisputeDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dispute details' })
  @ApiResponse({ status: 200, description: 'Dispute details retrieved successfully' })
  async getDispute(@Param('id') disputeId: string) {
    return this.disputeService.getDispute(disputeId);
  }

  @Get('match/:matchId')
  @ApiOperation({ summary: 'Get disputes for a match' })
  @ApiResponse({ status: 200, description: 'Disputes retrieved successfully' })
  async getMatchDisputes(@Param('matchId') matchId: string) {
    return this.disputeService.getMatchDisputes(matchId);
  }

  @Get('admin/open')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get all open disputes (admin only)' })
  @ApiResponse({ status: 200, description: 'Open disputes retrieved successfully' })
  async getOpenDisputes() {
    return this.disputeService.getOpenDisputes();
  }
}





