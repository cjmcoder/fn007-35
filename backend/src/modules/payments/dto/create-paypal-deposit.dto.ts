import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreatePayPalDepositDto {
  @ApiProperty({ 
    example: 10000, 
    description: 'Amount in cents (e.g., 10000 = $100.00)',
    minimum: 100,
    maximum: 100000
  })
  @IsNumber()
  @Min(100, { message: 'Minimum deposit amount is $1.00 (100 cents)' })
  @Max(100000, { message: 'Maximum deposit amount is $1,000.00 (100,000 cents)' })
  amountCents: number;

  @ApiProperty({ 
    example: 'USD', 
    description: 'Currency code',
    default: 'USD'
  })
  @IsOptional()
  @IsString()
  currency?: string;
}





