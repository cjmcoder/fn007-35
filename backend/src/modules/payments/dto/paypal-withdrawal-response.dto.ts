import { ApiProperty } from '@nestjs/swagger';

export class PayPalWithdrawalResponseDto {
  @ApiProperty({ 
    example: 'withdrawal_1704067200000_abc123def456', 
    description: 'Unique withdrawal ID' 
  })
  withdrawalId: string;

  @ApiProperty({ 
    example: 'PROCESSING', 
    description: 'Withdrawal status',
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']
  })
  status: string;

  @ApiProperty({ 
    example: 10000, 
    description: 'Amount in cents' 
  })
  amountCents: number;

  @ApiProperty({ 
    example: 10000, 
    description: 'FC amount withdrawn' 
  })
  fcAmount: number;

  @ApiProperty({ 
    example: 'PAYPAL_BATCH_123456789', 
    description: 'PayPal batch transaction ID',
    required: false
  })
  paypalTransactionId?: string;
}





