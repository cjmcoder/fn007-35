import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: 'John Doe', required: false })
  displayName?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  avatarUrl?: string;

  @ApiProperty({ example: ['USER'], enum: Role, isArray: true })
  roles: Role[];

  @ApiProperty({ example: 100.0 })
  trustScore: number;

  @ApiProperty({ example: false })
  tfaEnabled: boolean;

  @ApiProperty({ example: false })
  isBanned: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', required: false })
  lastLoginAt?: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}

export class ProfileResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid' })
  userId: string;

  @ApiProperty({ example: 'John Doe', required: false })
  displayName?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  avatarUrl?: string;

  @ApiProperty({ example: 'Gaming enthusiast and competitive player', required: false })
  bio?: string;

  @ApiProperty({ example: 'US', required: false })
  country?: string;

  @ApiProperty({ example: 'America/New_York', required: false })
  timezone?: string;

  @ApiProperty({ example: 1000 })
  rank: number;

  @ApiProperty({ example: 100 })
  trustScore: number;

  @ApiProperty({ example: 'john_doe_psn', required: false })
  psn?: string;

  @ApiProperty({ example: 'john_doe_xbox', required: false })
  xbox?: string;

  @ApiProperty({ example: 'john_doe_steam', required: false })
  steam?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: UserDto })
  user: UserDto;
}





