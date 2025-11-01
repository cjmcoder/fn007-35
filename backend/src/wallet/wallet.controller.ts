import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Query,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateDepositSessionDto,
  DepositSessionResponseDto,
  WithdrawDto,
  WithdrawalResponseDto,
  TransferDto,
  TransferResponseDto,
  WalletHistoryDto,
  WalletHistoryResponseDto,
  WalletBalanceDto,
  WebhookEventDto,
  AdjustBalanceDto,
  AdjustBalanceResponseDto,
} from './dto/wallet.dto';

@ApiTags('wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ 
    status: 200, 
    description: 'Wallet balance retrieved successfully',
    type: WalletBalanceDto 
  })
  async getBalance(@Req() req: Request): Promise<WalletBalanceDto> {
    const userId = (req as any).user.id;
    return this.walletService.getBalance(userId);
  }

  @Post('deposit/session')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create deposit session' })
  @ApiResponse({ 
    status: 200, 
    description: 'Deposit session created successfully',
    type: DepositSessionResponseDto 
  })
  async createDepositSession(
    @Body() createDepositSessionDto: CreateDepositSessionDto,
    @Req() req: Request,
  ): Promise<DepositSessionResponseDto> {
    const userId = (req as any).user.id;
    return this.walletService.createDepositSession(userId, createDepositSessionDto);
  }

  @Post('webhooks/:provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle payment webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(
    @Param('provider') provider: string,
    @Body() webhookEvent: WebhookEventDto,
    @Req() req: Request,
  ): Promise<{ received: boolean }> {
    const signature = req.headers['stripe-signature'] || req.headers['paypal-signature'];
    return this.walletService.handleWebhook(provider, webhookEvent, signature as string);
  }

  @Post('withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create withdrawal request' })
  @ApiResponse({ 
    status: 200, 
    description: 'Withdrawal request created successfully',
    type: WithdrawalResponseDto 
  })
  async withdraw(
    @Body() withdrawDto: WithdrawDto,
    @Req() req: Request,
  ): Promise<WithdrawalResponseDto> {
    const userId = (req as any).user.id;
    return this.walletService.withdraw(userId, withdrawDto);
  }

  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Transfer FC to another user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Transfer completed successfully',
    type: TransferResponseDto 
  })
  async transfer(
    @Body() transferDto: TransferDto,
    @Req() req: Request,
  ): Promise<TransferResponseDto> {
    const userId = (req as any).user.id;
    return this.walletService.transfer(userId, transferDto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get wallet transaction history' })
  @ApiResponse({ 
    status: 200, 
    description: 'Transaction history retrieved successfully',
    type: WalletHistoryResponseDto 
  })
  async getHistory(
    @Query() walletHistoryDto: WalletHistoryDto,
    @Req() req: Request,
  ): Promise<WalletHistoryResponseDto> {
    const userId = (req as any).user.id;
    return this.walletService.getHistory(userId, walletHistoryDto);
  }

  @Post('admin/adjust')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Adjust user balance (admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Balance adjusted successfully',
    type: AdjustBalanceResponseDto 
  })
  async adjustBalance(
    @Body() adjustBalanceDto: AdjustBalanceDto,
    @Req() req: Request,
  ): Promise<AdjustBalanceResponseDto> {
    const adminId = (req as any).user.id;
    return this.walletService.adjustBalance(adminId, adjustBalanceDto);
  }
}





