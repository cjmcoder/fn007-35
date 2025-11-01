import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { TwitchAuthGuard } from './guards/twitch-auth.guard';
import { DiscordAuthGuard } from './guards/discord-auth.guard';
import {
  LoginResponseDto,
  RefreshTokenDto,
  LogoutDto,
  LinkGamertagDto,
  LinkStreamDto,
  TwoFactorSetupDto,
  TwoFactorConfirmDto,
  EnableNotificationsDto,
  SetLimitsDto,
} from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('oauth/:provider')
  @ApiOperation({ summary: 'Initiate OAuth login' })
  @ApiQuery({ name: 'provider', enum: ['google', 'twitch', 'discord'] })
  @ApiResponse({ status: 302, description: 'Redirect to OAuth provider' })
  async initiateOAuth(@Query('provider') provider: string, @Res() res: Response) {
    const authUrl = await this.authService.getOAuthUrl(provider);
    res.redirect(authUrl);
  }

  @Get('oauth/:provider/callback')
  @ApiOperation({ summary: 'OAuth callback handler' })
  @ApiResponse({ 
    status: 200, 
    description: 'OAuth login successful',
    type: LoginResponseDto 
  })
  @ApiResponse({ status: 400, description: 'OAuth login failed' })
  async oauthCallback(
    @Query('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const result = await this.authService.handleOAuthCallback(provider, code, state);
      
      // Set HTTP-only cookies for security
      res.cookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });
      
      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Redirect to frontend with success
      res.redirect(`${process.env.FRONTEND_URL}/auth/success`);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=${encodeURIComponent(error.message)}`);
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refreshed successfully',
    type: LoginResponseDto 
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Body() logoutDto: LogoutDto, @Req() req: Request) {
    const userId = (req as any).user.id;
    await this.authService.logout(userId, logoutDto.refreshToken);
    return { message: 'Logout successful' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getProfile(@Req() req: Request) {
    return (req as any).user;
  }

  @Post('gamertag/link')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Link gaming platform gamertag' })
  @ApiResponse({ status: 200, description: 'Gamertag linked successfully' })
  async linkGamertag(@Body() linkGamertagDto: LinkGamertagDto, @Req() req: Request) {
    const userId = (req as any).user.id;
    return this.authService.linkGamertag(userId, linkGamertagDto);
  }

  @Post('stream/link')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Link streaming platform' })
  @ApiResponse({ status: 200, description: 'Stream linked successfully' })
  async linkStream(@Body() linkStreamDto: LinkStreamDto, @Req() req: Request) {
    const userId = (req as any).user.id;
    return this.authService.linkStream(userId, linkStreamDto);
  }

  @Post('2fa/setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Setup two-factor authentication' })
  @ApiResponse({ 
    status: 200, 
    description: '2FA setup initiated',
    type: TwoFactorSetupDto 
  })
  async setup2FA(@Req() req: Request) {
    const userId = (req as any).user.id;
    return this.authService.setup2FA(userId);
  }

  @Post('2fa/confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Confirm two-factor authentication setup' })
  @ApiResponse({ status: 200, description: '2FA enabled successfully' })
  async confirm2FA(@Body() twoFactorConfirmDto: TwoFactorConfirmDto, @Req() req: Request) {
    const userId = (req as any).user.id;
    return this.authService.confirm2FA(userId, twoFactorConfirmDto.code);
  }

  @Post('notifications/subscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Enable web push notifications' })
  @ApiResponse({ status: 200, description: 'Notifications enabled' })
  async enableNotifications(@Body() enableNotificationsDto: EnableNotificationsDto, @Req() req: Request) {
    const userId = (req as any).user.id;
    return this.authService.enableNotifications(userId, enableNotificationsDto);
  }

  @Post('limits')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Set account limits' })
  @ApiResponse({ status: 200, description: 'Limits updated successfully' })
  async setLimits(@Body() setLimitsDto: SetLimitsDto, @Req() req: Request) {
    const userId = (req as any).user.id;
    return this.authService.setLimits(userId, setLimitsDto);
  }
}





