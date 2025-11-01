import { ApiProperty } from '@nestjs/swagger';

export class GetBalanceResponseDto {
  @ApiProperty({ example: 1000.0, description: 'Available FC balance' })
  availableFc: number;

  @ApiProperty({ example: 100.0, description: 'Locked FC balance' })
  lockedFc: number;

  @ApiProperty({ example: 1100.0, description: 'Total FC balance' })
  totalFc: number;

  @ApiProperty({ example: 2000.0, description: 'Total FC deposited' })
  totalDeposited: number;

  @ApiProperty({ example: 900.0, description: 'Total FC withdrawn' })
  totalWithdrawn: number;
}





