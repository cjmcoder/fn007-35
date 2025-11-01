import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { PayPalPublicService } from './paypal-public.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreatePayPalDepositDto } from './dto/create-paypal-deposit.dto';
import { CreatePayPalWithdrawalDto } from './dto/create-paypal-withdrawal.dto';
import { PayPalDepositResponseDto } from './dto/paypal-deposit-response.dto';
import { PayPalWithdrawalResponseDto } from './dto/paypal-withdrawal-response.dto';
import { PayPalWebhookDto } from './dto/paypal-webhook.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paypalService: PayPalPublicService) {}

  @Post('paypal/deposit')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create PayPal deposit session' })
  @ApiResponse({ status: 200, description: 'Deposit session created successfully', type: PayPalDepositResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createPayPalDeposit(
    @CurrentUser() user: any,
    @Body() createDepositDto: CreatePayPalDepositDto,
  ): Promise<PayPalDepositResponseDto> {
    return this.paypalService.createDepositSession(
      user.id,
      createDepositDto.amountCents,
      createDepositDto.currency,
    );
  }

  @Post('paypal/deposit/capture/:orderId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Capture PayPal deposit order' })
  @ApiResponse({ status: 200, description: 'Deposit captured successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async capturePayPalDeposit(
    @CurrentUser() user: any,
    @Param('orderId') orderId: string,
  ): Promise<{ success: boolean; fcAmount: number }> {
    return this.paypalService.captureDeposit(orderId, user.id);
  }

  @Post('paypal/withdrawal')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request PayPal withdrawal (enqueued for processing)' })
  @ApiResponse({ status: 200, description: 'Withdrawal request created successfully', type: PayPalWithdrawalResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async requestPayPalWithdrawal(
    @CurrentUser() user: any,
    @Body() createWithdrawalDto: CreatePayPalWithdrawalDto,
  ): Promise<PayPalWithdrawalResponseDto> {
    return this.paypalService.requestWithdrawal(
      user.id,
      createWithdrawalDto.amountFc,
      createWithdrawalDto.paypalEmail,
    );
  }

  @Post('paypal/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'PayPal webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async handlePayPalWebhook(
    @Body() webhookDto: PayPalWebhookDto,
    @Headers('paypal-transmission-id') transmissionId: string,
    @Headers('paypal-cert-id') certId: string,
    @Headers('paypal-transmission-sig') transmissionSig: string,
    @Headers('paypal-transmission-time') transmissionTime: string,
    @Headers('paypal-auth-algo') authAlgo: string,
    @Req() req: any,
  ): Promise<{ success: boolean }> {
    // Construct the signature for verification
    const signature = {
      transmissionId,
      certId,
      transmissionSig,
      transmissionTime,
      authAlgo,
    };

    return this.paypalService.handleWebhook(webhookDto, JSON.stringify(signature));
  }

  @Get('paypal/withdrawal/:withdrawalId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get PayPal withdrawal status' })
  @ApiResponse({ status: 200, description: 'Withdrawal status retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Withdrawal not found' })
  async getWithdrawalStatus(
    @CurrentUser() user: any,
    @Param('withdrawalId') withdrawalId: string,
  ): Promise<{ status: string; amountFc: number; paypalTransactionId?: string }> {
    return this.paypalService.getWithdrawalStatus(withdrawalId, user.id);
  }
}
