import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-discord';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('OAUTH_DISCORD_CLIENT_ID'),
      clientSecret: configService.get<string>('OAUTH_DISCORD_CLIENT_SECRET'),
      callbackURL: `${configService.get<string>('FRONTEND_URL')}/api/auth/oauth/discord/callback`,
      scope: ['identify', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, username, email, avatar } = profile;
    
    const user = {
      provider: 'discord',
      providerId: id,
      email: email,
      name: username,
      picture: avatar ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png` : null,
      accessToken,
      refreshToken,
    };

    done(null, user);
  }
}





