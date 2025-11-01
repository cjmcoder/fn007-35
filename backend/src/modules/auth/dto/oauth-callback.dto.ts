import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class OAuthCallbackDto {
  @ApiProperty({
    description: 'Authorization code from OAuth provider',
    example: '4/0AX4XfWh...',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'State parameter for CSRF protection',
    example: 'abc123def456',
  })
  @IsString()
  state: string;

  @ApiProperty({
    description: 'Error code if OAuth failed',
    example: 'access_denied',
    required: false,
  })
  @IsOptional()
  @IsString()
  error?: string;

  @ApiProperty({
    description: 'Error description if OAuth failed',
    example: 'The user denied the request',
    required: false,
  })
  @IsOptional()
  @IsString()
  error_description?: string;
}





