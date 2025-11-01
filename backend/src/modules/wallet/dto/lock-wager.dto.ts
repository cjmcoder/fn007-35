import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class LockWagerDto {
  @IsString() 
  userId!: string;
  
  @IsString() 
  matchId!: string;
  
  @IsNumber() 
  @Min(0.01) 
  amountFc!: number; // client sends number; service converts to Decimal
  
  @IsOptional() 
  @IsString() 
  idempotencyKey?: string;
}





