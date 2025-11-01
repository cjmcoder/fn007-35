import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export enum PaymentProvider {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
}

export enum CryptoChain {
  BASE = 'base',
  POLYGON = 'polygon',
  SOLANA = 'solana',
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  WAGER_LOCK = 'WAGER_LOCK',
  WAGER_PAYOUT = 'WAGER_PAYOUT',
  WAGER_REFUND = 'WAGER_REFUND',
  PROP_ENTRY = 'PROP_ENTRY',
  PROP_PAYOUT = 'PROP_PAYOUT',
  PROP_REFUND = 'PROP_REFUND',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
  ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT',
  REFERRAL_BONUS = 'REFERRAL_BONUS',
}

export enum TransactionState {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum WithdrawalState {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export class CreateDepositSessionDto {
  @ApiProperty({ description: 'Payment provider', enum: PaymentProvider })
  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @ApiProperty({ description: 'Amount in cents', minimum: 100 })
  @IsNumber()
  @Min(100)
  @Transform(({ value }) => parseInt(value))
  amountCents: number;

  @ApiProperty({ description: 'Currency code', default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string = 'USD';
}

export class DepositSessionResponseDto {
  @ApiProperty({ description: 'Checkout URL for payment' })
  checkoutUrl: string;

  @ApiProperty({ description: 'Session ID for tracking' })
  sessionId: string;

  @ApiProperty({ description: 'Amount in cents' })
  amountCents: number;

  @ApiProperty({ description: 'FC amount to be credited' })
  fcAmount: number;
}

export class WithdrawDto {
  @ApiProperty({ description: 'Blockchain network', enum: CryptoChain })
  @IsEnum(CryptoChain)
  chain: CryptoChain;

  @ApiProperty({ description: 'Wallet address' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'Amount in FC', minimum: 1 })
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseFloat(value))
  amountFc: number;
}

export class WithdrawalResponseDto {
  @ApiProperty({ description: 'Withdrawal ID' })
  withdrawalId: string;

  @ApiProperty({ description: 'Withdrawal status', enum: WithdrawalState })
  state: WithdrawalState;

  @ApiProperty({ description: 'Estimated completion time' })
  estimatedCompletion: string;

  @ApiProperty({ description: 'Transaction hash (if available)' })
  txHash?: string;
}

export class TransferDto {
  @ApiProperty({ description: 'Recipient user ID' })
  @IsString()
  toUserId: string;

  @ApiProperty({ description: 'Amount in FC', minimum: 1 })
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseFloat(value))
  amountFc: number;

  @ApiProperty({ description: 'Transfer note (optional)' })
  @IsString()
  @IsOptional()
  note?: string;
}

export class TransferResponseDto {
  @ApiProperty({ description: 'Transfer ID' })
  transferId: string;

  @ApiProperty({ description: 'Transfer status' })
  status: string;

  @ApiProperty({ description: 'Amount transferred' })
  amountFc: number;

  @ApiProperty({ description: 'Recipient user ID' })
  toUserId: string;
}

export class WalletHistoryDto {
  @ApiProperty({ description: 'Pagination cursor' })
  @IsString()
  @IsOptional()
  cursor?: string;

  @ApiProperty({ description: 'Number of items per page', minimum: 1, maximum: 100, default: 20 })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @ApiProperty({ description: 'Filter by transaction type', enum: TransactionType, required: false })
  @IsEnum(TransactionType)
  @IsOptional()
  type?: TransactionType;
}

export class WalletHistoryResponseDto {
  @ApiProperty({ description: 'Transaction history items' })
  items: TransactionHistoryItemDto[];

  @ApiProperty({ description: 'Next page cursor' })
  nextCursor?: string;

  @ApiProperty({ description: 'Has more items' })
  hasMore: boolean;
}

export class TransactionHistoryItemDto {
  @ApiProperty({ description: 'Transaction ID' })
  id: string;

  @ApiProperty({ description: 'Transaction type', enum: TransactionType })
  type: TransactionType;

  @ApiProperty({ description: 'Amount in FC' })
  amount: number;

  @ApiProperty({ description: 'Transaction state', enum: TransactionState })
  state: TransactionState;

  @ApiProperty({ description: 'Reference type' })
  refType?: string;

  @ApiProperty({ description: 'Reference ID' })
  refId?: string;

  @ApiProperty({ description: 'Transaction timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Additional metadata' })
  metadata?: any;
}

export class WalletBalanceDto {
  @ApiProperty({ description: 'Available FC balance' })
  availableFc: number;

  @ApiProperty({ description: 'Locked FC balance' })
  lockedFc: number;

  @ApiProperty({ description: 'Total FC balance' })
  totalFc: number;

  @ApiProperty({ description: 'Total deposited' })
  totalDeposited: number;

  @ApiProperty({ description: 'Total withdrawn' })
  totalWithdrawn: number;
}

export class WebhookEventDto {
  @ApiProperty({ description: 'Event type' })
  type: string;

  @ApiProperty({ description: 'Event data' })
  data: any;

  @ApiProperty({ description: 'Event ID' })
  id: string;

  @ApiProperty({ description: 'Event timestamp' })
  created: number;
}

export class AdjustBalanceDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Balance adjustment (positive or negative)' })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  deltaFc: number;

  @ApiProperty({ description: 'Reason for adjustment' })
  @IsString()
  reason: string;
}

export class AdjustBalanceResponseDto {
  @ApiProperty({ description: 'Transaction ID' })
  transactionId: string;

  @ApiProperty({ description: 'New balance' })
  newBalance: number;

  @ApiProperty({ description: 'Adjustment amount' })
  adjustment: number;
}





