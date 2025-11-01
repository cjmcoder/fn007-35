import { IsString } from 'class-validator';

export class RefundMatchDto {
  @IsString() 
  matchId!: string;
  
  @IsString() 
  idempotencyKey!: string;
}





