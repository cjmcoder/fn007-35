import { IsString } from 'class-validator';

export class PayoutWinnerDto {
  @IsString() 
  matchId!: string;
  
  @IsString() 
  winnerId!: string;
  
  @IsString() 
  idempotencyKey!: string;
}





