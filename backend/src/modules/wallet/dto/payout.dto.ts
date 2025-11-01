import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class PayoutDto {
  @ApiProperty({ example: 'uuid', description: 'User ID to payout to' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 100.0, description: 'Amount of FC to payout' })
  @IsNumber()
  @Min(0.01)
  amountFc: number;

  @ApiProperty({ example: 'MATCH', description: 'Reference type' })
  @IsString()
  refType: string;

  @ApiProperty({ example: 'uuid', description: 'Reference ID' })
  @IsString()
  refId: string;

  @ApiProperty({ example: 'Match win payout', required: false, description: 'Payout reason' })
  @IsOptional()
  @IsString()
  reason?: string;
}





