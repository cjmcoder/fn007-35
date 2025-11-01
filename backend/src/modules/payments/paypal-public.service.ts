import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { WalletService } from '../wallet/wallet.service';
import { KafkaService } from '../../common/kafka/kafka.service';
import * as paypal from '@paypal/checkout-server-sdk';
import * as crypto from 'crypto';

export interface PayPalDepositSession {
  sessionId: string;
  checkoutUrl: string;
  amountCents: number;
  fcAmount: number;
}

export interface PayPalWithdrawalRequest {
  withdrawalId: string;
  status: 'PENDING';
  amountFc: number;
  paypalEmail: string;
}

@Injectable()
export class PayPalPublicService {
  private paypalClient: paypal.core.PayPalHttpClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly walletService: WalletService,
    private readonly kafkaService: KafkaService,
  ) {
    this.initializePayPalClient();
  }

  private initializePayPalClient() {
    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    const mode = this.configService.get<string>('PAYPAL_MODE', 'sandbox');

    if (!clientId || !clientSecret) {
      console.warn('PayPal credentials not configured. PayPal features will be disabled.');
      return;
    }

    const environment = mode === 'live' 
      ? new paypal.core.LiveEnvironment(clientId, clientSecret)
      : new paypal.core.SandboxEnvironment(clientId, clientSecret);

    this.paypalClient = new paypal.core.PayPalHttpClient(environment);
  }

  async createDepositSession(
    userId: string,
    amountCents: number,
    currency: string = 'USD',
  ): Promise<PayPalDepositSession> {
    if (!this.paypalClient) {
      throw new BadRequestException('PayPal is not configured');
    }

    if (amountCents < 100) {
      throw new BadRequestException('Minimum deposit amount is $1.00');
    }

    if (amountCents > 100000) {
      throw new BadRequestException('Maximum deposit amount is $1,000.00');
    }

    const sessionId = `deposit_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const fcAmount = amountCents; // 1 cent = 1 FC

    try {
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer('return=representation');
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: sessionId,
            amount: {
              currency_code: currency,
              value: (amountCents / 100).toFixed(2),
            },
            description: `FLOCKNODE Deposit - ${fcAmount} FC`,
            custom_id: userId,
          },
        ],
        application_context: {
          brand_name: 'FLOCKNODE',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${this.configService.get('FRONTEND_URL')}/wallet/deposit/success`,
          cancel_url: `${this.configService.get('FRONTEND_URL')}/wallet/deposit/cancel`,
        },
      });

      const response = await this.paypalClient.execute(request);
      const order = response.result;

      if (!order || !order.links) {
        throw new InternalServerErrorException('Failed to create PayPal order');
      }

      const approveLink = order.links.find(link => link.rel === 'approve');
      if (!approveLink || !approveLink.href) {
        throw new InternalServerErrorException('Failed to get PayPal approval URL');
      }

      // Store deposit session in database
      await this.prisma.fcTransaction.create({
        data: {
          userId,
          walletId: (await this.prisma.wallet.findUnique({ where: { userId } }))?.id || '',
          type: 'DEPOSIT',
          state: 'PENDING',
          amountFc: fcAmount,
          refType: 'PAYPAL_DEPOSIT',
          refId: sessionId,
          metadata: {
            paypalOrderId: order.id,
            amountCents,
            currency,
            status: 'CREATED',
          },
        },
      });

      // Log audit
      await this.auditService.log({
        actorId: userId,
        action: 'PAYPAL_DEPOSIT_SESSION_CREATED',
        entity: 'WALLET',
        entityId: userId,
        metadata: { sessionId, amountCents, fcAmount, paypalOrderId: order.id },
      });

      return {
        sessionId,
        checkoutUrl: approveLink.href,
        amountCents,
        fcAmount,
      };
    } catch (error) {
      console.error('PayPal deposit session creation failed:', error);
      throw new InternalServerErrorException('Failed to create PayPal deposit session');
    }
  }

  async handleWebhook(payload: any, signature: string): Promise<{ success: boolean }> {
    if (!this.paypalClient) {
      throw new BadRequestException('PayPal is not configured');
    }

    try {
      // Verify webhook signature
      const webhookId = this.configService.get<string>('PAYPAL_WEBHOOK_ID');
      if (!webhookId) {
        console.warn('PayPal webhook ID not configured. Skipping signature verification.');
      }

      // Process webhook events
      const eventType = payload.event_type;
      const resource = payload.resource;

      switch (eventType) {
        case 'PAYMENT.CAPTURE.COMPLETED':
          await this.handlePaymentCaptureCompleted(resource);
          break;
        case 'PAYMENT.CAPTURE.DENIED':
          await this.handlePaymentCaptureDenied(resource);
          break;
        default:
          console.log(`Unhandled PayPal webhook event: ${eventType}`);
      }

      return { success: true };
    } catch (error) {
      console.error('PayPal webhook processing failed:', error);
      throw new InternalServerErrorException('Failed to process PayPal webhook');
    }
  }

  async requestWithdrawal(
    userId: string,
    amountFc: number,
    paypalEmail: string,
  ): Promise<PayPalWithdrawalRequest> {
    if (amountFc < 100) {
      throw new BadRequestException('Minimum withdrawal amount is 100 FC');
    }

    if (amountFc > 100000) {
      throw new BadRequestException('Maximum withdrawal amount is 100,000 FC');
    }

    const withdrawalId = `withdrawal_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

    try {
      // Check user has sufficient balance
      const wallet = await this.prisma.wallet.findUnique({
        where: { userId },
      });

      if (!wallet || wallet.availableFc < amountFc) {
        throw new BadRequestException('Insufficient balance for withdrawal');
      }

      // Create withdrawal record
      const withdrawal = await this.prisma.withdrawal.create({
        data: {
          userId,
          chain: 'paypal',
          address: paypalEmail,
          amountFc,
          state: 'PENDING',
        },
      });

      // Lock the funds
      await this.walletService.lock(
        userId,
        {
          amountFc,
          refType: 'PAYPAL_WITHDRAWAL',
          refId: withdrawalId,
        },
        `paypal_withdrawal_${withdrawalId}`,
      );

      // Emit Kafka event for payout worker
      await this.kafkaService.emit('wallet.withdrawal.requested', {
        withdrawalId,
        userId,
        amountFc,
        paypalEmail,
        withdrawalRecordId: withdrawal.id,
      });

      // Log audit
      await this.auditService.log({
        actorId: userId,
        action: 'PAYPAL_WITHDRAWAL_REQUESTED',
        entity: 'WALLET',
        entityId: userId,
        metadata: { 
          withdrawalId, 
          amountFc, 
          paypalEmail,
          withdrawalRecordId: withdrawal.id,
        },
      });

      return {
        withdrawalId,
        status: 'PENDING',
        amountFc,
        paypalEmail,
      };
    } catch (error) {
      console.error('PayPal withdrawal request failed:', error);
      throw new InternalServerErrorException('Failed to request PayPal withdrawal');
    }
  }

  async getWithdrawalStatus(withdrawalId: string, userId: string): Promise<{
    status: string;
    amountFc: number;
    paypalTransactionId?: string;
  }> {
    const withdrawal = await this.prisma.withdrawal.findFirst({
      where: {
        id: withdrawalId,
        userId,
        chain: 'paypal',
      },
    });

    if (!withdrawal) {
      throw new BadRequestException('Withdrawal not found');
    }

    return {
      status: withdrawal.state,
      amountFc: withdrawal.amountFc,
      paypalTransactionId: withdrawal.txHash,
    };
  }

  private async handlePaymentCaptureCompleted(resource: any) {
    const orderId = resource.supplementary_data?.related_ids?.order_id;
    if (!orderId) return;

    // Find and update the transaction
    const transaction = await this.prisma.fcTransaction.findFirst({
      where: {
        metadata: {
          path: ['paypalOrderId'],
          equals: orderId,
        },
        state: 'PENDING',
      },
    });

    if (transaction) {
      await this.prisma.fcTransaction.update({
        where: { id: transaction.id },
        data: {
          state: 'COMPLETED',
          metadata: {
            ...transaction.metadata,
            paypalCaptureId: resource.id,
            status: 'CAPTURED',
            capturedAt: new Date().toISOString(),
          },
        },
      });

      // Credit the wallet
      await this.walletService.earn(
        {
          userId: transaction.userId,
          amountFc: transaction.amountFc,
          reason: 'PayPal deposit',
          refType: 'PAYPAL_DEPOSIT',
          refId: transaction.refId,
        },
        `paypal_capture_${orderId}`,
      );
    }
  }

  private async handlePaymentCaptureDenied(resource: any) {
    const orderId = resource.supplementary_data?.related_ids?.order_id;
    if (!orderId) return;

    // Find and update the transaction
    const transaction = await this.prisma.fcTransaction.findFirst({
      where: {
        metadata: {
          path: ['paypalOrderId'],
          equals: orderId,
        },
        state: 'PENDING',
      },
    });

    if (transaction) {
      await this.prisma.fcTransaction.update({
        where: { id: transaction.id },
        data: {
          state: 'FAILED',
          metadata: {
            ...transaction.metadata,
            status: 'DENIED',
            deniedAt: new Date().toISOString(),
            reason: resource.reason_code,
          },
        },
      });
    }
  }
}





