import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { TwitchAuthGuard } from './guards/twitch-auth.guard';
import { DiscordAuthGuard } from './guards/discord-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { OAuthCallbackDto } from './dto/oauth-callback.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { TokensResponseDto } from './dto/tokens-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('oauth/:provider')
  @ApiOperation({ summary: 'Initiate OAuth login with provider' })
  @ApiQuery({ name: 'provider', enum: ['google', 'twitch', 'discord'] })
  @ApiResponse({ status: 200, description: 'OAuth URL generated successfully' })
  async initiateOAuth(
    @Query('provider') provider: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!['google', 'twitch', 'discord'].includes(provider)) {
      throw new BadRequestException('Invalid OAuth provider');
    }

    const authUrl = await this.authService.getOAuthUrl(provider, req);
    res.redirect(authUrl);
  }

  @Public()
  @Get('oauth/:provider/callback')
  @ApiOperation({ summary: 'OAuth callback endpoint' })
  @ApiResponse({ status: 200, description: 'OAuth callback processed successfully' })
  async oAuthCallback(
    @Query() query: OAuthCallbackDto,
    @Query('provider') provider: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!['google', 'twitch', 'discord'].includes(provider)) {
      throw new BadRequestException('Invalid OAuth provider');
    }

    const result = await this.authService.handleOAuthCallback(provider, query, req);
    
    // Set tokens as httpOnly cookies for web clients
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend with success
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    res.redirect(`${frontendUrl}/auth/success`);
  }

  @Public()
  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully', type: TokensResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshTokens(
    @CurrentUser() user: any,
    @Body() refreshTokenDto: RefreshTokenDto,
    @Res() res: Response,
  ) {
    const result = await this.authService.refreshTokens(user.id, refreshTokenDto.refreshToken);
    
    // Update cookies
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json(result);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user and revoke refresh tokens' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  async logout(
    @CurrentUser() user: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.authService.logout(user.id, req);
    
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    res.json({ message: 'Logged out successfully' });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({ status: 200, description: 'User information retrieved successfully', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@CurrentUser() user: any) {
    return this.authService.getCurrentUser(user.id);
  }

  @Post('revoke-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke all refresh tokens for current user' })
  @ApiResponse({ status: 200, description: 'All refresh tokens revoked successfully' })
  async revokeAllTokens(@CurrentUser() user: any) {
    await this.authService.revokeAllRefreshTokens(user.id);
    return { message: 'All refresh tokens revoked successfully' };
  }
}





