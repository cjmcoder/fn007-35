import { ApiProperty } from '@nestjs/swagger';

export class TransferResponseDto {
  @ApiProperty({ example: 'uuid', description: 'Transfer transaction ID' })
  transferId: string;

  @ApiProperty({ example: 'COMPLETED', description: 'Transfer status' })
  status: string;

  @ApiProperty({ example: 100.0, description: 'Transfer amount' })
  amountFc: number;

  @ApiProperty({ example: 'uuid', description: 'Sender user ID' })
  fromUserId: string;

  @ApiProperty({ example: 'uuid', description: 'Recipient user ID' })
  toUserId: string;

  @ApiProperty({ example: 900.0, description: 'New sender balance' })
  newBalance: number;
}





