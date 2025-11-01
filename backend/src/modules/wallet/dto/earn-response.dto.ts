import { ApiProperty } from '@nestjs/swagger';

export class EarnResponseDto {
  @ApiProperty({ example: 'uuid', description: 'Transaction ID' })
  transactionId: string;

  @ApiProperty({ example: 'COMPLETED', description: 'Transaction status' })
  status: string;

  @ApiProperty({ example: 50.0, description: 'Amount credited' })
  amountFc: number;

  @ApiProperty({ example: 1050.0, description: 'New balance after credit' })
  newBalance: number;
}





