import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class EarnDto {
  @ApiProperty({ example: 'uuid', description: 'User ID to credit FC to' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 50.0, description: 'Amount of FC to credit' })
  @IsNumber()
  @Min(0.01)
  amountFc: number;

  @ApiProperty({ example: 'Match win bonus', description: 'Reason for earning FC' })
  @IsString()
  reason: string;

  @ApiProperty({ example: 'MATCH', required: false, description: 'Reference type' })
  @IsOptional()
  @IsString()
  refType?: string;

  @ApiProperty({ example: 'uuid', required: false, description: 'Reference ID' })
  @IsOptional()
  @IsString()
  refId?: string;
}





