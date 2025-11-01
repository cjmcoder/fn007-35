import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-twitch';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TwitchStrategy extends PassportStrategy(Strategy, 'twitch') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('OAUTH_TWITCH_CLIENT_ID'),
      clientSecret: configService.get<string>('OAUTH_TWITCH_CLIENT_SECRET'),
      callbackURL: `${configService.get<string>('FRONTEND_URL')}/api/auth/oauth/twitch/callback`,
      scope: 'user:read:email',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, display_name, email, profile_image_url } = profile;
    
    const user = {
      provider: 'twitch',
      providerId: id,
      email: email,
      name: display_name,
      picture: profile_image_url,
      accessToken,
      refreshToken,
    };

    done(null, user);
  }
}





