import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PayPalFeeService } from './paypal-fee.service';

@ApiTags('PayPal Payments')
@Controller('payments/paypal')
export class PayPalFeeController {
  constructor(private readonly paypalService: PayPalFeeService) {}

  @Post('deposit/session')
  @ApiOperation({ summary: 'Create PayPal deposit session with fee calculation' })
  @ApiResponse({ 
    status: 201, 
    description: 'Deposit session created successfully',
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string' },
        userPays: { type: 'number' },
        fcReceived: { type: 'number' },
        feeBreakdown: {
          type: 'object',
          properties: {
            paypalFee: { type: 'number' },
            percentageFee: { type: 'number' },
            fixedFee: { type: 'number' }
          }
        },
        minimumAmount: { type: 'number' }
      }
    }
  })
  async createDepositSession(
    @Body() body: { amount: number },
    @Req() req: any
  ) {
    const userId = req.user?.id || 'demo_user';
    return this.paypalService.createDepositSession(userId, body.amount);
  }

  @Post('deposit/process')
  @ApiOperation({ summary: 'Process PayPal deposit payment' })
  @ApiResponse({ 
    status: 200, 
    description: 'Deposit processed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        transactionId: { type: 'string' },
        amount: { type: 'number' },
        fees: { type: 'number' },
        netAmount: { type: 'number' }
      }
    }
  })
  async processDeposit(
    @Body() body: { sessionId: string; amount: number }
  ) {
    return this.paypalService.simulatePayPalPayment(body.sessionId, body.amount);
  }

  @Post('withdrawal/request')
  @ApiOperation({ summary: 'Create PayPal withdrawal request with fee calculation' })
  @ApiResponse({ 
    status: 201, 
    description: 'Withdrawal request created successfully',
    schema: {
      type: 'object',
      properties: {
        requestId: { type: 'string' },
        fcAmount: { type: 'number' },
        userReceives: { type: 'number' },
        feeBreakdown: {
          type: 'object',
          properties: {
            paypalFee: { type: 'number' },
            percentageFee: { type: 'number' },
            fixedFee: { type: 'number' }
          }
        },
        minimumAmount: { type: 'number' }
      }
    }
  })
  async createWithdrawalRequest(
    @Body() body: { fcAmount: number },
    @Req() req: any
  ) {
    const userId = req.user?.id || 'demo_user';
    return this.paypalService.createWithdrawalRequest(userId, body.fcAmount);
  }

  @Post('withdrawal/process')
  @ApiOperation({ summary: 'Process PayPal withdrawal payout' })
  @ApiResponse({ 
    status: 200, 
    description: 'Withdrawal processed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        transactionId: { type: 'string' },
        fcAmount: { type: 'number' },
        fees: { type: 'number' },
        netAmount: { type: 'number' }
      }
    }
  })
  async processWithdrawal(
    @Body() body: { requestId: string; fcAmount: number }
  ) {
    return this.paypalService.simulatePayPalPayout(body.requestId, body.fcAmount);
  }

  @Get('fees/structure')
  @ApiOperation({ summary: 'Get fee structure information' })
  @ApiResponse({ 
    status: 200, 
    description: 'Fee structure retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        paypal: {
          type: 'object',
          properties: {
            percentage: { type: 'number' },
            fixed: { type: 'number' },
            description: { type: 'string' }
          }
        },
        match: {
          type: 'object',
          properties: {
            percentage: { type: 'number' },
            description: { type: 'string' }
          }
        },
        propVig: {
          type: 'object',
          properties: {
            percentage: { type: 'number' },
            description: { type: 'string' }
          }
        },
        minimums: {
          type: 'object',
          properties: {
            deposit: { type: 'number' },
            withdrawal: { type: 'number' }
          }
        }
      }
    }
  })
  async getFeeStructure() {
    return this.paypalService.getFeeStructure();
  }

  @Post('fees/match')
  @ApiOperation({ summary: 'Calculate match entry fees' })
  @ApiResponse({ 
    status: 200, 
    description: 'Match fees calculated successfully',
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
  async calculateMatchFees(@Body() body: { matchAmount: number }) {
    return this.paypalService.calculateMatchFees(body.matchAmount);
  }

  @Post('fees/prop-vig')
  @ApiOperation({ summary: 'Calculate prop bet house vig' })
  @ApiResponse({ 
    status: 200, 
    description: 'Prop vig calculated successfully',
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
    return this.paypalService.calculatePropVig(body.wagerAmount);
  }
}





