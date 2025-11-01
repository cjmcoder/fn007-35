import { Injectable, Logger } from '@nestjs/common';
import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  // Business metrics
  private readonly userRegistrations: Counter<string>;
  private readonly userLogins: Counter<string>;
  private readonly matchesCreated: Counter<string>;
  private readonly matchesCompleted: Counter<string>;
  private readonly wagersPlaced: Counter<string>;
  private readonly wagersWon: Counter<string>;
  private readonly depositsProcessed: Counter<string>;
  private readonly withdrawalsProcessed: Counter<string>;
  private readonly fcTransferred: Counter<string>;

  // System metrics
  private readonly activeUsers: Gauge<string>;
  private readonly activeMatches: Gauge<string>;
  private readonly totalWagered: Gauge<string>;
  private readonly averageMatchDuration: Histogram<string>;

  constructor() {
    // Collect default Node.js metrics
    collectDefaultMetrics({ register });

    // Business metrics
    this.userRegistrations = new Counter({
      name: 'flocknode_user_registrations_total',
      help: 'Total number of user registrations',
      labelNames: ['method'], // oauth provider
      registers: [register],
    });

    this.userLogins = new Counter({
      name: 'flocknode_user_logins_total',
      help: 'Total number of user logins',
      labelNames: ['method'], // oauth provider
      registers: [register],
    });

    this.matchesCreated = new Counter({
      name: 'flocknode_matches_created_total',
      help: 'Total number of matches created',
      labelNames: ['game', 'platform'],
      registers: [register],
    });

    this.matchesCompleted = new Counter({
      name: 'flocknode_matches_completed_total',
      help: 'Total number of matches completed',
      labelNames: ['game', 'platform', 'outcome'], // outcome: completed, forfeit, dispute
      registers: [register],
    });

    this.wagersPlaced = new Counter({
      name: 'flocknode_wagers_placed_total',
      help: 'Total number of wagers placed',
      labelNames: ['type'], // match, prop
      registers: [register],
    });

    this.wagersWon = new Counter({
      name: 'flocknode_wagers_won_total',
      help: 'Total number of wagers won',
      labelNames: ['type'], // match, prop
      registers: [register],
    });

    this.depositsProcessed = new Counter({
      name: 'flocknode_deposits_processed_total',
      help: 'Total number of deposits processed',
      labelNames: ['provider'], // stripe, paypal, crypto
      registers: [register],
    });

    this.withdrawalsProcessed = new Counter({
      name: 'flocknode_withdrawals_processed_total',
      help: 'Total number of withdrawals processed',
      labelNames: ['chain'], // base, polygon, solana
      registers: [register],
    });

    this.fcTransferred = new Counter({
      name: 'flocknode_fc_transferred_total',
      help: 'Total FC transferred between users',
      labelNames: ['type'], // transfer, wager_payout, prop_payout
      registers: [register],
    });

    // System metrics
    this.activeUsers = new Gauge({
      name: 'flocknode_active_users',
      help: 'Number of currently active users',
      registers: [register],
    });

    this.activeMatches = new Gauge({
      name: 'flocknode_active_matches',
      help: 'Number of currently active matches',
      labelNames: ['game'],
      registers: [register],
    });

    this.totalWagered = new Gauge({
      name: 'flocknode_total_wagered_fc',
      help: 'Total FC currently wagered in active matches',
      registers: [register],
    });

    this.averageMatchDuration = new Histogram({
      name: 'flocknode_match_duration_seconds',
      help: 'Duration of completed matches in seconds',
      labelNames: ['game', 'platform'],
      buckets: [60, 300, 600, 1800, 3600, 7200, 14400], // 1min to 4hours
      registers: [register],
    });

    this.logger.log('✅ Metrics service initialized');
  }

  // Business metric methods
  recordUserRegistration(method: string): void {
    this.userRegistrations.inc({ method });
  }

  recordUserLogin(method: string): void {
    this.userLogins.inc({ method });
  }

  recordMatchCreated(game: string, platform: string): void {
    this.matchesCreated.inc({ game, platform });
  }

  recordMatchCompleted(game: string, platform: string, outcome: string): void {
    this.matchesCompleted.inc({ game, platform, outcome });
  }

  recordWagerPlaced(type: string): void {
    this.wagersPlaced.inc({ type });
  }

  recordWagerWon(type: string): void {
    this.wagersWon.inc({ type });
  }

  recordDepositProcessed(provider: string): void {
    this.depositsProcessed.inc({ provider });
  }

  recordWithdrawalProcessed(chain: string): void {
    this.withdrawalsProcessed.inc({ chain });
  }

  recordFcTransferred(type: string, amount: number): void {
    this.fcTransferred.inc({ type }, amount);
  }

  // System metric methods
  setActiveUsers(count: number): void {
    this.activeUsers.set(count);
  }

  setActiveMatches(game: string, count: number): void {
    this.activeMatches.set({ game }, count);
  }

  setTotalWagered(amount: number): void {
    this.totalWagered.set(amount);
  }

  recordMatchDuration(game: string, platform: string, durationSeconds: number): void {
    this.averageMatchDuration.observe({ game, platform }, durationSeconds);
  }

  // Get all metrics
  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  // Get metrics in JSON format
  async getMetricsAsJson(): Promise<any> {
    return register.getMetricsAsJSON();
  }

  // Clear all metrics (useful for testing)
  clearMetrics(): void {
    register.clear();
    this.logger.warn('All metrics cleared');
  }
}





