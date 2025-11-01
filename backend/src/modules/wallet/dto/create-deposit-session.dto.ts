import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, Min } from 'class-validator';

export enum DepositProvider {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
}

export class CreateDepositSessionDto {
  @ApiProperty({ enum: DepositProvider, description: 'Payment provider' })
  @IsEnum(DepositProvider)
  provider: DepositProvider;

  @ApiProperty({ example: 10000, description: 'Amount in cents' })
  @IsNumber()
  @Min(100)
  amountCents: number;

  @ApiProperty({ example: 'USD', description: 'Currency' })
  @IsString()
  currency: string;
}





