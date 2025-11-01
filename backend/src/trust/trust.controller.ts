import { Controller, Get, Req } from '@nestjs/common';
import { TrustService } from './trust.service';

@Controller('trust')
export class TrustController {
  constructor(private trust: TrustService) {}

  @Get('me')
  async me(@Req() req: any) {
    const userId = req.user?.id ?? 'demo-user';
    const prof = await this.trust.get(userId);
    // Compute effects server-side for convenience
    const effects: string[] = [];
    if (prof.score < 60) effects.push('locked_quickmatch', 'stake_cap_10');
    else if (prof.score > 150) effects.push('verified_challenger');
    else if (prof.score >= 100) effects.push('priority_pairing');
    return { score: prof.score, effects };
  }
}

