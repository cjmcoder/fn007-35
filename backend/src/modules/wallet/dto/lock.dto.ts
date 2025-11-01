import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class LockDto {
  @ApiProperty({ example: 100.0, description: 'Amount of FC to lock' })
  @IsNumber()
  @Min(0.01)
  amountFc: number;

  @ApiProperty({ example: 'MATCH', description: 'Reference type' })
  @IsString()
  refType: string;

  @ApiProperty({ example: 'uuid', description: 'Reference ID' })
  @IsString()
  refId: string;
}





