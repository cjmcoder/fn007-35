import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class TransferDto {
  @ApiProperty({ example: 'uuid', description: 'Recipient user ID' })
  @IsString()
  toUserId: string;

  @ApiProperty({ example: 100.0, description: 'Amount of FC to transfer' })
  @IsNumber()
  @Min(0.01)
  amountFc: number;

  @ApiProperty({ example: 'Thanks for the match!', required: false, description: 'Transfer note' })
  @IsOptional()
  @IsString()
  note?: string;
}





