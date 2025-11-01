import { ApiProperty } from '@nestjs/swagger';

export class PayoutResponseDto {
  @ApiProperty({ example: 'uuid', description: 'Transaction ID' })
  transactionId: string;

  @ApiProperty({ example: 'COMPLETED', description: 'Transaction status' })
  status: string;

  @ApiProperty({ example: 100.0, description: 'Amount paid out' })
  amountFc: number;

  @ApiProperty({ example: 1100.0, description: 'New balance after payout' })
  newBalance: number;
}





