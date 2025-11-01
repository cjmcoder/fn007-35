import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min } from 'class-validator';

export class UnlockDto {
  @ApiProperty({ example: 100.0, description: 'Amount of FC to unlock' })
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





