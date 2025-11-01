import { Injectable, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import { KafkaService } from '../common/kafka/kafka.service';
import { MetricsService } from '../common/metrics/metrics.service';
import { StripeService } from './services/stripe.service';
import { PayPalService } from './services/paypal.service';
import { CryptoService } from './services/crypto.service';
import { v4 as uuidv4 } from 'uuid';
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
  TransactionType,
  TransactionState,
  WithdrawalState,
} from './dto/wallet.dto';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private prismaService: PrismaService,
    private redisService: RedisService,
    private kafkaService: KafkaService,
    private metricsService: MetricsService,
    private stripeService: StripeService,
    private paypalService: PayPalService,
    private cryptoService: CryptoService,
    private configService: ConfigService,
  ) {}

  async getBalance(userId: string): Promise<WalletBalanceDto> {
    const wallet = await this.prismaService.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    return {
      availableFc: wallet.availableFc,
      lockedFc: wallet.lockedFc,
      totalFc: wallet.availableFc + wallet.lockedFc,
      totalDeposited: wallet.totalDeposited,
      totalWithdrawn: wallet.totalWithdrawn,
    };
  }

  async createDepositSession(
    userId: string,
    createDepositSessionDto: CreateDepositSessionDto,
  ): Promise<DepositSessionResponseDto> {
    const { provider, amountCents, currency = 'USD' } = createDepositSessionDto;

    // Check daily deposit limits
    await this.checkDepositLimits(userId, amountCents);

    // Calculate FC amount (1 USD = 100 FC)
    const fcAmount = amountCents;

    // Create idempotency key
    const idempotencyKey = `deposit:${userId}:${amountCents}:${provider}:${new Date().toISOString().split('T')[0]}`;
    
    // Check if already processed
    const existingSession = await this.redisService.get(idempotencyKey);
    if (existingSession) {
      const session = JSON.parse(existingSession);
      return {
        checkoutUrl: session.checkoutUrl,
        sessionId: session.sessionId,
        amountCents: session.amountCents,
        fcAmount: session.fcAmount,
      };
    }

    let checkoutUrl: string;
    let sessionId: string;

    // Create payment session based on provider
    switch (provider) {
      case 'stripe':
        const stripeSession = await this.stripeService.createCheckoutSession({
          amount: amountCents,
          currency,
          userId,
          fcAmount,
        });
        checkoutUrl = stripeSession.url;
        sessionId = stripeSession.id;
        break;

      case 'paypal':
        const paypalSession = await this.paypalService.createOrder({
          amount: amountCents,
          currency,
          userId,
          fcAmount,
        });
        checkoutUrl = paypalSession.approveUrl;
        sessionId = paypalSession.id;
        break;

      default:
        throw new BadRequestException('Unsupported payment provider');
    }

    // Store session data
    const sessionData = {
      checkoutUrl,
      sessionId,
      amountCents,
      fcAmount,
      userId,
      provider,
      createdAt: new Date().toISOString(),
    };

    await this.redisService.set(idempotencyKey, JSON.stringify(sessionData), 3600); // 1 hour

    // Emit domain event
    const event = this.kafkaService.createEvent(
      'wallet.deposit.session.created',
      userId,
      'User',
      { provider, amountCents, fcAmount, sessionId },
      { userId }
    );
    await this.kafkaService.publishEvent('wallet.events', event);

    return {
      checkoutUrl,
      sessionId,
      amountCents,
      fcAmount,
    };
  }

  async handleWebhook(
    provider: string,
    webhookEvent: WebhookEventDto,
    signature: string,
  ): Promise<{ received: boolean }> {
    try {
      let isValid = false;
      let eventData: any;

      // Verify webhook signature
      switch (provider) {
        case 'stripe':
          isValid = await this.stripeService.verifyWebhookSignature(webhookEvent, signature);
          eventData = webhookEvent.data.object;
          break;

        case 'paypal':
          isValid = await this.paypalService.verifyWebhookSignature(webhookEvent, signature);
          eventData = webhookEvent.data;
          break;

        default:
          throw new BadRequestException('Unsupported webhook provider');
      }

      if (!isValid) {
        throw new BadRequestException('Invalid webhook signature');
      }

      // Process webhook event
      await this.processWebhookEvent(provider, webhookEvent.type, eventData);

      return { received: true };
    } catch (error) {
      this.logger.error('Webhook processing error:', error);
      throw error;
    }
  }

  private async processWebhookEvent(provider: string, eventType: string, eventData: any): Promise<void> {
    switch (provider) {
      case 'stripe':
        await this.processStripeWebhook(eventType, eventData);
        break;

      case 'paypal':
        await this.processPayPalWebhook(eventType, eventData);
        break;
    }
  }

  private async processStripeWebhook(eventType: string, eventData: any): Promise<void> {
    if (eventType === 'checkout.session.completed') {
      const session = eventData;
      const userId = session.metadata?.userId;
      const fcAmount = parseFloat(session.metadata?.fcAmount || '0');

      if (userId && fcAmount > 0) {
        await this.creditFc(userId, fcAmount, 'DEPOSIT', 'STRIPE', session.id);
        
        // Emit domain event
        const event = this.kafkaService.createEvent(
          'wallet.fc.credited',
          userId,
          'User',
          { amount: fcAmount, provider: 'STRIPE', sessionId: session.id },
          { userId }
        );
        await this.kafkaService.publishEvent('wallet.events', event);

        // Emit accounting event
        const accountingEvent = this.kafkaService.createEvent(
          'accounting.deposit.recorded',
          userId,
          'User',
          { amount: fcAmount, provider: 'STRIPE', sessionId: session.id },
          { userId }
        );
        await this.kafkaService.publishEvent('accounting.events', accountingEvent);

        this.metricsService.recordDepositProcessed('stripe');
      }
    }
  }

  private async processPayPalWebhook(eventType: string, eventData: any): Promise<void> {
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const payment = eventData;
      const userId = payment.custom_id;
      const fcAmount = parseFloat(payment.amount?.value || '0') * 100; // Convert to cents

      if (userId && fcAmount > 0) {
        await this.creditFc(userId, fcAmount, 'DEPOSIT', 'PAYPAL', payment.id);
        
        // Emit domain events
        const event = this.kafkaService.createEvent(
          'wallet.fc.credited',
          userId,
          'User',
          { amount: fcAmount, provider: 'PAYPAL', paymentId: payment.id },
          { userId }
        );
        await this.kafkaService.publishEvent('wallet.events', event);

        this.metricsService.recordDepositProcessed('paypal');
      }
    }
  }

  async withdraw(userId: string, withdrawDto: WithdrawDto): Promise<WithdrawalResponseDto> {
    const { chain, address, amountFc } = withdrawDto;

    // Check withdrawal limits
    await this.checkWithdrawalLimits(userId, amountFc);

    // Check available balance
    const wallet = await this.getWallet(userId);
    if (wallet.availableFc < amountFc) {
      throw new BadRequestException('Insufficient balance');
    }

    // Lock funds
    await this.lockFunds(userId, amountFc);

    // Create withdrawal record
    const withdrawal = await this.prismaService.withdrawal.create({
      data: {
        userId,
        chain,
        address,
        amountFc,
        state: 'PENDING',
      },
    });

    // Process withdrawal asynchronously
    this.processWithdrawal(withdrawal.id).catch(error => {
      this.logger.error('Withdrawal processing error:', error);
    });

    // Emit domain event
    const event = this.kafkaService.createEvent(
      'wallet.withdrawal.requested',
      userId,
      'User',
      { withdrawalId: withdrawal.id, chain, address, amountFc },
      { userId }
    );
    await this.kafkaService.publishEvent('wallet.events', event);

    return {
      withdrawalId: withdrawal.id,
      state: 'PENDING',
      estimatedCompletion: this.getEstimatedCompletion(chain),
    };
  }

  async transfer(userId: string, transferDto: TransferDto): Promise<TransferResponseDto> {
    const { toUserId, amountFc, note } = transferDto;

    // Validate recipient
    const recipient = await this.prismaService.user.findUnique({
      where: { id: toUserId },
    });

    if (!recipient) {
      throw new BadRequestException('Recipient not found');
    }

    if (recipient.id === userId) {
      throw new BadRequestException('Cannot transfer to yourself');
    }

    // Check available balance
    const wallet = await this.getWallet(userId);
    if (wallet.availableFc < amountFc) {
      throw new BadRequestException('Insufficient balance');
    }

    // Execute transfer atomically
    const transferId = uuidv4();
    
    await this.prismaService.executeTransaction(async (prisma) => {
      // Debit from sender
      await prisma.wallet.update({
        where: { userId },
        data: {
          availableFc: { decrement: amountFc },
        },
      });

      // Credit to recipient
      await prisma.wallet.upsert({
        where: { userId: toUserId },
        update: {
          availableFc: { increment: amountFc },
        },
        create: {
          userId: toUserId,
          availableFc: amountFc,
        },
      });

      // Create transaction records
      await prisma.fcTransaction.createMany({
        data: [
          {
            userId,
            type: 'TRANSFER_OUT',
            amount: -amountFc,
            refType: 'TRANSFER',
            refId: transferId,
            state: 'COMPLETED',
            metadata: { toUserId, note },
          },
          {
            userId: toUserId,
            type: 'TRANSFER_IN',
            amount: amountFc,
            refType: 'TRANSFER',
            refId: transferId,
            state: 'COMPLETED',
            metadata: { fromUserId: userId, note },
          },
        ],
      });
    });

    // Emit domain event
    const event = this.kafkaService.createEvent(
      'wallet.transfer.completed',
      userId,
      'User',
      { transferId, toUserId, amountFc, note },
      { userId }
    );
    await this.kafkaService.publishEvent('wallet.events', event);

    this.metricsService.recordFcTransferred('transfer', amountFc);

    return {
      transferId,
      status: 'COMPLETED',
      amountFc,
      toUserId,
    };
  }

  async getHistory(
    userId: string,
    walletHistoryDto: WalletHistoryDto,
  ): Promise<WalletHistoryResponseDto> {
    const { cursor, limit = 20, type } = walletHistoryDto;

    const where: any = { userId };
    if (type) {
      where.type = type;
    }

    const transactions = await this.prismaService.fcTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const hasMore = transactions.length > limit;
    const items = hasMore ? transactions.slice(0, -1) : transactions;

    return {
      items: items.map(tx => ({
        id: tx.id,
        type: tx.type as TransactionType,
        amount: tx.amount,
        state: tx.state as TransactionState,
        refType: tx.refType,
        refId: tx.refId,
        createdAt: tx.createdAt,
        metadata: tx.metadata,
      })),
      nextCursor: hasMore ? items[items.length - 1].id : undefined,
      hasMore,
    };
  }

  async adjustBalance(
    adminId: string,
    adjustBalanceDto: AdjustBalanceDto,
  ): Promise<AdjustBalanceResponseDto> {
    const { userId, deltaFc, reason } = adjustBalanceDto;

    // Check admin permissions
    const admin = await this.prismaService.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || !admin.roles.includes('ADMIN')) {
      throw new ForbiddenException('Admin access required');
    }

    // Execute adjustment atomically
    const transactionId = uuidv4();
    
    const result = await this.prismaService.executeTransaction(async (prisma) => {
      // Update wallet
      const wallet = await prisma.wallet.upsert({
        where: { userId },
        update: {
          availableFc: { increment: deltaFc },
        },
        create: {
          userId,
          availableFc: deltaFc > 0 ? deltaFc : 0,
        },
      });

      // Create transaction record
      await prisma.fcTransaction.create({
        data: {
          userId,
          type: 'ADMIN_ADJUSTMENT',
          amount: deltaFc,
          refType: 'ADMIN_ADJUSTMENT',
          refId: transactionId,
          state: 'COMPLETED',
          metadata: { adminId, reason, deltaFc },
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: 'WALLET_ADJUST',
          entity: 'Wallet',
          entityId: userId,
          metadata: { deltaFc, reason, transactionId },
        },
      });

      return wallet;
    });

    // Emit domain event
    const event = this.kafkaService.createEvent(
      'wallet.admin.adjusted',
      userId,
      'User',
      { adminId, deltaFc, reason, transactionId },
      { userId }
    );
    await this.kafkaService.publishEvent('wallet.events', event);

    return {
      transactionId,
      newBalance: result.availableFc,
      adjustment: deltaFc,
    };
  }

  // Helper methods
  private async getWallet(userId: string) {
    const wallet = await this.prismaService.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      // Create wallet if it doesn't exist
      return this.prismaService.wallet.create({
        data: {
          userId,
          availableFc: 0,
          lockedFc: 0,
        },
      });
    }

    return wallet;
  }

  private async creditFc(
    userId: string,
    amount: number,
    type: TransactionType,
    provider: string,
    referenceId: string,
  ): Promise<void> {
    await this.prismaService.executeTransaction(async (prisma) => {
      // Update wallet
      await prisma.wallet.upsert({
        where: { userId },
        update: {
          availableFc: { increment: amount },
          totalDeposited: { increment: amount },
        },
        create: {
          userId,
          availableFc: amount,
          totalDeposited: amount,
        },
      });

      // Create transaction record
      await prisma.fcTransaction.create({
        data: {
          userId,
          type,
          amount,
          refType: provider,
          refId: referenceId,
          state: 'COMPLETED',
        },
      });
    });
  }

  private async lockFunds(userId: string, amount: number): Promise<void> {
    await this.prismaService.wallet.update({
      where: { userId },
      data: {
        availableFc: { decrement: amount },
        lockedFc: { increment: amount },
      },
    });
  }

  private async unlockFunds(userId: string, amount: number): Promise<void> {
    await this.prismaService.wallet.update({
      where: { userId },
      data: {
        availableFc: { increment: amount },
        lockedFc: { decrement: amount },
      },
    });
  }

  private async processWithdrawal(withdrawalId: string): Promise<void> {
    const withdrawal = await this.prismaService.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      return;
    }

    try {
      // Update status to processing
      await this.prismaService.withdrawal.update({
        where: { id: withdrawalId },
        data: { state: 'PROCESSING' },
      });

      // Process crypto withdrawal
      const txHash = await this.cryptoService.sendTransaction({
        chain: withdrawal.chain,
        to: withdrawal.address,
        amount: withdrawal.amountFc,
      });

      // Update withdrawal with transaction hash
      await this.prismaService.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          state: 'COMPLETED',
          txHash,
        },
      });

      // Update wallet
      await this.prismaService.wallet.update({
        where: { userId: withdrawal.userId },
        data: {
          lockedFc: { decrement: withdrawal.amountFc },
          totalWithdrawn: { increment: withdrawal.amountFc },
        },
      });

      // Create transaction record
      await this.prismaService.fcTransaction.create({
        data: {
          userId: withdrawal.userId,
          type: 'WITHDRAWAL',
          amount: -withdrawal.amountFc,
          refType: 'WITHDRAWAL',
          refId: withdrawalId,
          state: 'COMPLETED',
          metadata: { txHash, chain: withdrawal.chain },
        },
      });

      // Emit domain event
      const event = this.kafkaService.createEvent(
        'wallet.withdrawal.settled',
        withdrawal.userId,
        'User',
        { withdrawalId, txHash, amount: withdrawal.amountFc },
        { userId: withdrawal.userId }
      );
      await this.kafkaService.publishEvent('wallet.events', event);

      this.metricsService.recordWithdrawalProcessed(withdrawal.chain);

    } catch (error) {
      this.logger.error('Withdrawal processing failed:', error);

      // Update withdrawal status
      await this.prismaService.withdrawal.update({
        where: { id: withdrawalId },
        data: { state: 'FAILED' },
      });

      // Unlock funds
      await this.unlockFunds(withdrawal.userId, withdrawal.amountFc);
    }
  }

  private async checkDepositLimits(userId: string, amountCents: number): Promise<void> {
    const dailyLimit = 10000; // $100 per day
    const today = new Date().toISOString().split('T')[0];
    
    const dailyDeposits = await this.prismaService.fcTransaction.aggregate({
      where: {
        userId,
        type: 'DEPOSIT',
        createdAt: {
          gte: new Date(today),
        },
      },
      _sum: {
        amount: true,
      },
    });

    const totalToday = (dailyDeposits._sum.amount || 0) + amountCents;
    if (totalToday > dailyLimit) {
      throw new BadRequestException('Daily deposit limit exceeded');
    }
  }

  private async checkWithdrawalLimits(userId: string, amountFc: number): Promise<void> {
    const dailyLimit = 5000; // 5000 FC per day
    const today = new Date().toISOString().split('T')[0];
    
    const dailyWithdrawals = await this.prismaService.fcTransaction.aggregate({
      where: {
        userId,
        type: 'WITHDRAWAL',
        createdAt: {
          gte: new Date(today),
        },
      },
      _sum: {
        amount: true,
      },
    });

    const totalToday = Math.abs(dailyWithdrawals._sum.amount || 0) + amountFc;
    if (totalToday > dailyLimit) {
      throw new BadRequestException('Daily withdrawal limit exceeded');
    }
  }

  private getEstimatedCompletion(chain: string): string {
    const estimates = {
      base: '5-10 minutes',
      polygon: '2-5 minutes',
      solana: '1-2 minutes',
    };
    return estimates[chain] || '5-15 minutes';
  }
}





