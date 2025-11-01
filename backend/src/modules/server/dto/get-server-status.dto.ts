import { IsString } from 'class-validator';

export class GetServerStatusDto {
  @IsString()
  matchId!: string;
}





