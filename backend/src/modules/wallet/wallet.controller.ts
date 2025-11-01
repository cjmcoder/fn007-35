import { Controller, Get, Post, Body, UseGuards, Request, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LockWagerDto } from './dto/lock-wager.dto';
import { PayoutWinnerDto } from './dto/payout-winner.dto';
import { RefundMatchDto } from './dto/refund-match.dto';

export class GetBalanceResponse {
  availableFc: number;
  lockedFc: number;
  totalFc: number;
  totalDeposited: number;
  totalWithdrawn: number;
}

export class GetHistoryResponse {
  items: any[];
  nextCursor?: string;
  hasMore: boolean;
}

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ status: 200, description: 'Wallet balance retrieved successfully' })
  async getBalance(@Request() req): Promise<GetBalanceResponse> {
    return this.walletService.getBalance(req.user.id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get transaction history' })
  @ApiResponse({ status: 200, description: 'Transaction history retrieved successfully' })
  async getHistory(
    @Request() req,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ): Promise<GetHistoryResponse> {
    return this.walletService.getHistory(req.user.id, cursor, limit);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get wallet transactions' })
  @ApiResponse({ status: 200, description: 'Wallet transactions retrieved successfully' })
  async getTransactions(
    @Request() req,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ): Promise<GetHistoryResponse> {
    return this.walletService.getHistory(req.user.id, cursor, limit);
  }

  @Post('lock')
  @ApiOperation({ summary: 'Lock wager for match' })
  @ApiResponse({ status: 200, description: 'Wager locked successfully' })
  async lockWager(
    @Body() dto: LockWagerDto,
    @Headers('Idempotency-Key') idem?: string,
  ) {
    return this.walletService.lockWager(dto.userId, dto.matchId, dto.amountFc, dto.idempotencyKey ?? idem ?? '');
  }

  // Internal/admin/referee routes – keep behind RBAC
  @Post('payout')
  @ApiOperation({ summary: 'Payout winner (admin only)' })
  @ApiResponse({ status: 200, description: 'Winner paid out successfully' })
  async payout(@Body() dto: PayoutWinnerDto) {
    return this.walletService.payoutWinner(dto.matchId, dto.winnerId, dto.idempotencyKey);
  }

  @Post('refund')
  @ApiOperation({ summary: 'Refund match (admin only)' })
  @ApiResponse({ status: 200, description: 'Match refunded successfully' })
  async refund(@Body() dto: RefundMatchDto) {
    return this.walletService.refundMatch(dto.matchId, dto.idempotencyKey);
  }
}