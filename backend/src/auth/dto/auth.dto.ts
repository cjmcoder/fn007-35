import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export enum OAuthProvider {
  GOOGLE = 'google',
  TWITCH = 'twitch',
  DISCORD = 'discord',
}

export class OAuthCallbackDto {
  @ApiProperty({ description: 'OAuth provider', enum: OAuthProvider })
  @IsEnum(OAuthProvider)
  provider: OAuthProvider;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token' })
  refreshToken: string;

  @ApiProperty({ description: 'User information' })
  user: UserDto;
}

export class UserDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'Display name', required: false })
  displayName?: string;

  @ApiProperty({ description: 'Avatar URL', required: false })
  avatarUrl?: string;

  @ApiProperty({ description: 'User roles', type: [String] })
  roles: string[];

  @ApiProperty({ description: 'Trust score' })
  trustScore: number;

  @ApiProperty({ description: 'Two-factor authentication enabled' })
  tfaEnabled: boolean;

  @ApiProperty({ description: 'Account creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last login timestamp', required: false })
  lastLoginAt?: Date;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token' })
  @IsString()
  refreshToken: string;
}

export class LogoutDto {
  @ApiProperty({ description: 'Refresh token to invalidate' })
  @IsString()
  refreshToken: string;
}

export class LinkGamertagDto {
  @ApiProperty({ description: 'Gaming platform', enum: ['PS5', 'XBOX_SERIES_X', 'PC', 'SWITCH', 'MOBILE'] })
  @IsEnum(['PS5', 'XBOX_SERIES_X', 'PC', 'SWITCH', 'MOBILE'])
  platform: string;

  @ApiProperty({ description: 'Gamertag/username for the platform' })
  @IsString()
  gamertag: string;
}

export class LinkStreamDto {
  @ApiProperty({ description: 'Streaming provider', enum: ['twitch', 'youtube'] })
  @IsEnum(['twitch', 'youtube'])
  provider: string;

  @ApiProperty({ description: 'Channel ID for the streaming platform' })
  @IsString()
  channelId: string;
}

export class TwoFactorSetupDto {
  @ApiProperty({ description: 'QR code for 2FA setup' })
  qr: string;

  @ApiProperty({ description: 'Masked secret key' })
  secretMasked: string;
}

export class TwoFactorConfirmDto {
  @ApiProperty({ description: '6-digit TOTP code' })
  @IsString()
  @Transform(({ value }) => value?.toString().trim())
  code: string;
}

export class EnableNotificationsDto {
  @ApiProperty({ description: 'Web push endpoint' })
  @IsString()
  endpoint: string;

  @ApiProperty({ description: 'P256DH key' })
  @IsString()
  p256dh: string;

  @ApiProperty({ description: 'Auth key' })
  @IsString()
  auth: string;
}

export class SetLimitsDto {
  @ApiProperty({ description: 'Daily wager cap in FC', minimum: 0 })
  @Transform(({ value }) => parseFloat(value))
  dailyWagerCapFc: number;

  @ApiProperty({ description: 'Withdrawal cooldown in minutes', minimum: 0 })
  @Transform(({ value }) => parseInt(value))
  withdrawCooldownMin: number;
}





