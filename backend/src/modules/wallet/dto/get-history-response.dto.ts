import { ApiProperty } from '@nestjs/swagger';
import { TransactionType, TransactionState } from '@prisma/client';

export class TransactionItemDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ enum: TransactionType })
  type: TransactionType;

  @ApiProperty({ enum: TransactionState })
  state: TransactionState;

  @ApiProperty({ example: 100.0 })
  amountFc: number;

  @ApiProperty({ example: 1100.0, required: false })
  balanceAfterFc?: number;

  @ApiProperty({ example: 'MATCH', required: false })
  refType?: string;

  @ApiProperty({ example: 'uuid', required: false })
  refId?: string;

  @ApiProperty({ example: { note: 'Transfer to friend' }, required: false })
  metadata?: any;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}

export class GetHistoryResponseDto {
  @ApiProperty({ type: [TransactionItemDto] })
  items: TransactionItemDto[];

  @ApiProperty({ example: 'next_cursor_id', required: false })
  nextCursor?: string;

  @ApiProperty({ example: true })
  hasMore: boolean;
}





