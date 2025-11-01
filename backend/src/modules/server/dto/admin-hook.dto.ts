import { IsString, IsNumber, IsOptional } from 'class-validator';

export class AdminHookDto {
  @IsString()
  status!: string;
  
  @IsNumber()
  ts!: number;
  
  @IsOptional()
  @IsString()
  message?: string;
  
  @IsOptional()
  @IsString()
  version?: string;
}





