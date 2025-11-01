import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-discord';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('oauth.discord.clientId'),
      clientSecret: configService.get<string>('oauth.discord.clientSecret'),
      callbackURL: configService.get<string>('oauth.discord.callbackUrl'),
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
      id,
      email: email,
      name: username,
      picture: avatar ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png` : null,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}





