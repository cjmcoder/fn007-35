import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEmail, Min, Max } from 'class-validator';

export class CreatePayPalWithdrawalDto {
  @ApiProperty({ 
    example: 10000, 
    description: 'Amount in FC to withdraw',
    minimum: 100,
    maximum: 100000
  })
  @IsNumber()
  @Min(100, { message: 'Minimum withdrawal amount is 100 FC' })
  @Max(100000, { message: 'Maximum withdrawal amount is 100,000 FC' })
  amountFc: number;

  @ApiProperty({ 
    example: 'user@example.com', 
    description: 'PayPal email address to receive the withdrawal'
  })
  @IsEmail({}, { message: 'Please provide a valid PayPal email address' })
  paypalEmail: string;
}





