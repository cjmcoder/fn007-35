import { Injectable } from '@nestjs/common';

@Injectable()
export class FlockTubeService {
  async isLive(url: string) { return !!url; } // stub true when URL exists
  async verifyOverlayNonce(url: string, nonce: string) { return !!url && !!nonce; } // stub
  onOverlayWin(matchId: string, cb: (winnerUserId: string) => Promise<void>) {
    // wire later to real overlay events; leave stub
    return () => {}; // unsubscribe
  }
}

