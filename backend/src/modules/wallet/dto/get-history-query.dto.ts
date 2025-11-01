import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType, TransactionState } from '@prisma/client';

export class GetHistoryQueryDto {
  @ApiProperty({ example: 'cursor_id', required: false, description: 'Pagination cursor' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({ example: 20, required: false, description: 'Number of items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({ enum: TransactionType, required: false, description: 'Filter by transaction type' })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiProperty({ enum: TransactionState, required: false, description: 'Filter by transaction state' })
  @IsOptional()
  @IsEnum(TransactionState)
  state?: TransactionState;
}





