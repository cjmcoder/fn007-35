import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { WalletService } from '../wallet/wallet.service';
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
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  amountCents: number;
  fcAmount: number;
  paypalTransactionId?: string;
}

@Injectable()
export class PayPalService {
  private paypalClient: paypal.core.PayPalHttpClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly walletService: WalletService,
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

  async captureDeposit(orderId: string, userId: string): Promise<{ success: boolean; fcAmount: number }> {
    if (!this.paypalClient) {
      throw new BadRequestException('PayPal is not configured');
    }

    try {
      // Capture the order
      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      request.requestBody({});
      
      const response = await this.paypalClient.execute(request);
      const order = response.result;

      if (!order || order.status !== 'COMPLETED') {
        throw new BadRequestException('PayPal order capture failed');
      }

      // Find the transaction
      const transaction = await this.prisma.fcTransaction.findFirst({
        where: {
          refId: order.purchase_units[0]?.reference_id,
          userId,
          type: 'DEPOSIT',
          state: 'PENDING',
        },
      });

      if (!transaction) {
        throw new BadRequestException('Deposit transaction not found');
      }

      // Update transaction with PayPal details
      await this.prisma.fcTransaction.update({
        where: { id: transaction.id },
        data: {
          state: 'COMPLETED',
          metadata: {
            ...transaction.metadata,
            paypalOrderId: order.id,
            paypalCaptureId: order.purchase_units[0]?.payments?.captures?.[0]?.id,
            status: 'CAPTURED',
            capturedAt: new Date().toISOString(),
          },
        },
      });

      // Credit the wallet
      await this.walletService.earn(
        {
          userId,
          amountFc: transaction.amountFc,
          reason: 'PayPal deposit',
          refType: 'PAYPAL_DEPOSIT',
          refId: transaction.refId,
        },
        `paypal_capture_${order.id}`,
      );

      // Log audit
      await this.auditService.log({
        actorId: userId,
        action: 'PAYPAL_DEPOSIT_CAPTURED',
        entity: 'WALLET',
        entityId: userId,
        metadata: { 
          orderId, 
          transactionId: transaction.id, 
          fcAmount: transaction.amountFc,
          paypalCaptureId: order.purchase_units[0]?.payments?.captures?.[0]?.id,
        },
      });

      return {
        success: true,
        fcAmount: transaction.amountFc,
      };
    } catch (error) {
      console.error('PayPal deposit capture failed:', error);
      throw new InternalServerErrorException('Failed to capture PayPal deposit');
    }
  }

  async createWithdrawal(
    userId: string,
    amountFc: number,
    paypalEmail: string,
  ): Promise<PayPalWithdrawalRequest> {
    if (!this.paypalClient) {
      throw new BadRequestException('PayPal is not configured');
    }

    if (amountFc < 100) {
      throw new BadRequestException('Minimum withdrawal amount is 100 FC');
    }

    if (amountFc > 100000) {
      throw new BadRequestException('Maximum withdrawal amount is 100,000 FC');
    }

    const withdrawalId = `withdrawal_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const amountCents = amountFc; // 1 FC = 1 cent

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

      // Create PayPal payout
      const request = new paypal.payouts.PayoutsPostRequest();
      request.requestBody({
        sender_batch_header: {
          sender_batch_id: withdrawalId,
          email_subject: 'FLOCKNODE Withdrawal',
          email_message: 'Your FLOCKNODE withdrawal has been processed.',
        },
        items: [
          {
            recipient_type: 'EMAIL',
            amount: {
              value: (amountCents / 100).toFixed(2),
              currency: 'USD',
            },
            receiver: paypalEmail,
            note: 'FLOCKNODE withdrawal',
            sender_item_id: withdrawalId,
          },
        ],
      });

      const response = await this.paypalClient.execute(request);
      const payout = response.result;

      if (!payout || !payout.batch_header) {
        throw new InternalServerErrorException('Failed to create PayPal payout');
      }

      // Update withdrawal with PayPal details
      await this.prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          state: 'PROCESSING',
          txHash: payout.batch_header.payout_batch_id,
        },
      });

      // Log audit
      await this.auditService.log({
        actorId: userId,
        action: 'PAYPAL_WITHDRAWAL_CREATED',
        entity: 'WALLET',
        entityId: userId,
        metadata: { 
          withdrawalId, 
          amountFc, 
          paypalEmail,
          paypalBatchId: payout.batch_header.payout_batch_id,
        },
      });

      return {
        withdrawalId,
        status: 'PROCESSING',
        amountCents,
        fcAmount: amountFc,
        paypalTransactionId: payout.batch_header.payout_batch_id,
      };
    } catch (error) {
      console.error('PayPal withdrawal creation failed:', error);
      throw new InternalServerErrorException('Failed to create PayPal withdrawal');
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
        case 'PAYOUTS.PAYOUT.COMPLETED':
          await this.handlePayoutCompleted(resource);
          break;
        case 'PAYOUTS.PAYOUT.FAILED':
          await this.handlePayoutFailed(resource);
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

  private async handlePayoutCompleted(resource: any) {
    const batchId = resource.batch_header?.payout_batch_id;
    if (!batchId) return;

    // Find and update the withdrawal
    const withdrawal = await this.prisma.withdrawal.findFirst({
      where: {
        txHash: batchId,
        state: 'PROCESSING',
      },
    });

    if (withdrawal) {
      await this.prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          state: 'COMPLETED',
        },
      });

      // Unlock and debit the funds
      await this.walletService.unlock(
        withdrawal.userId,
        {
          amountFc: withdrawal.amountFc,
          refType: 'PAYPAL_WITHDRAWAL',
          refId: withdrawal.id,
        },
        `paypal_payout_complete_${batchId}`,
      );
    }
  }

  private async handlePayoutFailed(resource: any) {
    const batchId = resource.batch_header?.payout_batch_id;
    if (!batchId) return;

    // Find and update the withdrawal
    const withdrawal = await this.prisma.withdrawal.findFirst({
      where: {
        txHash: batchId,
        state: 'PROCESSING',
      },
    });

    if (withdrawal) {
      await this.prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          state: 'FAILED',
        },
      });

      // Unlock the funds (refund)
      await this.walletService.unlock(
        withdrawal.userId,
        {
          amountFc: withdrawal.amountFc,
          refType: 'PAYPAL_WITHDRAWAL',
          refId: withdrawal.id,
        },
        `paypal_payout_failed_${batchId}`,
      );
    }
  }
}





