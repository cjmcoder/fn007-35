import { ApiProperty } from '@nestjs/swagger';

export class LockResponseDto {
  @ApiProperty({ example: 'uuid', description: 'Transaction ID' })
  transactionId: string;

  @ApiProperty({ example: 'COMPLETED', description: 'Transaction status' })
  status: string;

  @ApiProperty({ example: 100.0, description: 'Amount locked' })
  amountFc: number;

  @ApiProperty({ example: 900.0, description: 'New available balance' })
  newAvailableFc: number;

  @ApiProperty({ example: 200.0, description: 'New locked balance' })
  newLockedFc: number;
}





