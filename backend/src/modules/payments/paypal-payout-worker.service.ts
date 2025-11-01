import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { WalletService } from '../wallet/wallet.service';
import { KafkaService } from '../../common/kafka/kafka.service';
import * as paypal from '@paypal/checkout-server-sdk';

interface WithdrawalRequestEvent {
  withdrawalId: string;
  userId: string;
  amountFc: number;
  paypalEmail: string;
  withdrawalRecordId: string;
}

@Injectable()
export class PayPalPayoutWorkerService {
  private readonly logger = new Logger(PayPalPayoutWorkerService.name);
  private paypalClient: paypal.core.PayPalHttpClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly walletService: WalletService,
    private readonly kafkaService: KafkaService,
  ) {
    this.initializePayPalClient();
    this.startPayoutWorker();
  }

  private initializePayPalClient() {
    const clientId = this.configService.get<string>('PAYPAL_PAYOUT_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_PAYOUT_CLIENT_SECRET');
    const mode = this.configService.get<string>('PAYPAL_MODE', 'sandbox');

    if (!clientId || !clientSecret) {
      this.logger.warn('PayPal payout credentials not configured. Payout worker will be disabled.');
      return;
    }

    const environment = mode === 'live' 
      ? new paypal.core.LiveEnvironment(clientId, clientSecret)
      : new paypal.core.SandboxEnvironment(clientId, clientSecret);

    this.paypalClient = new paypal.core.PayPalHttpClient(environment);
    this.logger.log('PayPal payout client initialized');
  }

  private async startPayoutWorker() {
    if (!this.paypalClient) {
      this.logger.warn('PayPal client not initialized. Skipping payout worker startup.');
      return;
    }

    try {
      // Subscribe to withdrawal requests
      await this.kafkaService.subscribe('wallet.withdrawal.requested', async (message) => {
        await this.processWithdrawalRequest(message);
      });

      this.logger.log('PayPal payout worker started successfully');
    } catch (error) {
      this.logger.error('Failed to start PayPal payout worker:', error);
    }
  }

  private async processWithdrawalRequest(event: WithdrawalRequestEvent) {
    const { withdrawalId, userId, amountFc, paypalEmail, withdrawalRecordId } = event;

    this.logger.log(`Processing withdrawal request: ${withdrawalId}`);

    try {
      // Update withdrawal status to PROCESSING
      await this.prisma.withdrawal.update({
        where: { id: withdrawalRecordId },
        data: { state: 'PROCESSING' },
      });

      // Create PayPal payout
      const payoutResult = await this.createPayPalPayout(withdrawalId, amountFc, paypalEmail);

      if (payoutResult.success) {
        // Update withdrawal with PayPal batch ID
        await this.prisma.withdrawal.update({
          where: { id: withdrawalRecordId },
          data: {
            state: 'PROCESSING',
            txHash: payoutResult.batchId,
          },
        });

        // Emit settlement event
        await this.kafkaService.emit('wallet.withdrawal.settled', {
          withdrawalId,
          userId,
          amountFc,
          paypalEmail,
          withdrawalRecordId,
          paypalBatchId: payoutResult.batchId,
          status: 'PROCESSING',
        });

        this.logger.log(`PayPal payout created successfully: ${payoutResult.batchId}`);
      } else {
        // Handle payout failure
        await this.handlePayoutFailure(withdrawalRecordId, payoutResult.error);
      }
    } catch (error) {
      this.logger.error(`Failed to process withdrawal ${withdrawalId}:`, error);
      await this.handlePayoutFailure(withdrawalRecordId, error.message);
    }
  }

  private async createPayPalPayout(
    withdrawalId: string,
    amountFc: number,
    paypalEmail: string,
  ): Promise<{ success: boolean; batchId?: string; error?: string }> {
    try {
      const amountCents = amountFc; // 1 FC = 1 cent
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
        return { success: false, error: 'Failed to create PayPal payout' };
      }

      return { 
        success: true, 
        batchId: payout.batch_header.payout_batch_id 
      };
    } catch (error) {
      this.logger.error('PayPal payout creation failed:', error);
      return { 
        success: false, 
        error: error.message || 'Unknown PayPal error' 
      };
    }
  }

  private async handlePayoutFailure(withdrawalRecordId: string, error: string) {
    try {
      // Update withdrawal status to FAILED
      await this.prisma.withdrawal.update({
        where: { id: withdrawalRecordId },
        data: { state: 'FAILED' },
      });

      // Get withdrawal details for unlocking funds
      const withdrawal = await this.prisma.withdrawal.findUnique({
        where: { id: withdrawalRecordId },
      });

      if (withdrawal) {
        // Unlock the funds (refund)
        await this.walletService.unlock(
          withdrawal.userId,
          {
            amountFc: withdrawal.amountFc,
            refType: 'PAYPAL_WITHDRAWAL',
            refId: withdrawal.id,
          },
          `paypal_payout_failed_${withdrawalRecordId}`,
        );

        // Log audit
        await this.auditService.log({
          actorId: withdrawal.userId,
          action: 'PAYPAL_WITHDRAWAL_FAILED',
          entity: 'WALLET',
          entityId: withdrawal.userId,
          metadata: { 
            withdrawalRecordId, 
            error,
            amountFc: withdrawal.amountFc,
          },
        });
      }

      this.logger.error(`Withdrawal ${withdrawalRecordId} failed: ${error}`);
    } catch (unlockError) {
      this.logger.error(`Failed to unlock funds for withdrawal ${withdrawalRecordId}:`, unlockError);
    }
  }

  // Handle PayPal webhook events for payout status updates
  async handlePayoutWebhook(payload: any): Promise<{ success: boolean }> {
    try {
      const eventType = payload.event_type;
      const resource = payload.resource;

      switch (eventType) {
        case 'PAYOUTS.PAYOUT.COMPLETED':
          await this.handlePayoutCompleted(resource);
          break;
        case 'PAYOUTS.PAYOUT.FAILED':
          await this.handlePayoutFailed(resource);
          break;
        default:
          this.logger.log(`Unhandled PayPal payout webhook event: ${eventType}`);
      }

      return { success: true };
    } catch (error) {
      this.logger.error('PayPal payout webhook processing failed:', error);
      return { success: false };
    }
  }

  private async handlePayoutCompleted(resource: any) {
    const batchId = resource.batch_header?.payout_batch_id;
    if (!batchId) return;

    this.logger.log(`PayPal payout completed: ${batchId}`);

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
        data: { state: 'COMPLETED' },
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

      // Log audit
      await this.auditService.log({
        actorId: withdrawal.userId,
        action: 'PAYPAL_WITHDRAWAL_COMPLETED',
        entity: 'WALLET',
        entityId: withdrawal.userId,
        metadata: { 
          withdrawalId: withdrawal.id,
          paypalBatchId: batchId,
          amountFc: withdrawal.amountFc,
        },
      });

      this.logger.log(`Withdrawal ${withdrawal.id} completed successfully`);
    }
  }

  private async handlePayoutFailed(resource: any) {
    const batchId = resource.batch_header?.payout_batch_id;
    if (!batchId) return;

    this.logger.log(`PayPal payout failed: ${batchId}`);

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
        data: { state: 'FAILED' },
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

      // Log audit
      await this.auditService.log({
        actorId: withdrawal.userId,
        action: 'PAYPAL_WITHDRAWAL_FAILED',
        entity: 'WALLET',
        entityId: withdrawal.userId,
        metadata: { 
          withdrawalId: withdrawal.id,
          paypalBatchId: batchId,
          amountFc: withdrawal.amountFc,
          reason: 'PayPal payout failed',
        },
      });

      this.logger.log(`Withdrawal ${withdrawal.id} failed and funds refunded`);
    }
  }
}





