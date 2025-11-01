import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'username123' })
  @IsString()
  @MinLength(3)
  username!: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  displayName!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password!: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password!: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken!: string;

  @ApiProperty({
    example: {
      id: 'user123',
      email: 'user@example.com',
      username: 'username123',
      displayName: 'John Doe',
      roles: ['user'],
      trustScore: 100.0,
      tfaEnabled: false,
      isBanned: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      lastLoginAt: '2024-01-01T00:00:00.000Z'
    }
  })
  user!: {
    id: string;
    email: string;
    username: string;
    displayName: string;
    roles: string;
    trustScore: number;
    tfaEnabled: boolean;
    isBanned: boolean;
    createdAt: Date;
    lastLoginAt?: Date;
  };
}
