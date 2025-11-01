import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-twitch';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TwitchStrategy extends PassportStrategy(Strategy, 'twitch') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('oauth.twitch.clientId'),
      clientSecret: configService.get<string>('oauth.twitch.clientSecret'),
      callbackURL: configService.get<string>('oauth.twitch.callbackUrl'),
      scope: ['user:read:email'],
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
      id,
      email: email,
      name: display_name,
      picture: profile_image_url,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}





