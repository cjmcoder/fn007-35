import { ApiProperty } from '@nestjs/swagger';

export class UnlockResponseDto {
  @ApiProperty({ example: 'uuid', description: 'Transaction ID' })
  transactionId: string;

  @ApiProperty({ example: 'COMPLETED', description: 'Transaction status' })
  status: string;

  @ApiProperty({ example: 100.0, description: 'Amount unlocked' })
  amountFc: number;

  @ApiProperty({ example: 1000.0, description: 'New available balance' })
  newAvailableFc: number;

  @ApiProperty({ example: 100.0, description: 'New locked balance' })
  newLockedFc: number;
}





