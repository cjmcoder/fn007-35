import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';

export enum GamertagPlatform {
  PSN = 'psn',
  XBOX = 'xbox',
  STEAM = 'steam',
}

export class LinkGamertagDto {
  @ApiProperty({ enum: GamertagPlatform, description: 'Gaming platform' })
  @IsEnum(GamertagPlatform)
  platform: GamertagPlatform;

  @ApiProperty({ example: 'john_doe_gamer', description: 'Gamertag/handle' })
  @IsString()
  gamertag: string;
}





