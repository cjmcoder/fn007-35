import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { FeeCalculatorService } from '../payments/fee-calculator.service';

export interface Prop {
  id: string;
  title: string;
  description: string;
  category: 'game' | 'tournament' | 'player' | 'team';
  game?: string;
  options: PropOption[];
  status: 'open' | 'closed' | 'settled';
  totalWagered: number;
  houseVig: number;
  createdAt: Date;
  closesAt: Date;
  settledAt?: Date;
  winningOptionId?: string;
}

export interface PropOption {
  id: string;
  title: string;
  odds: number; // Decimal odds (e.g., 2.5 = 3/2)
  totalWagered: number;
  wagerCount: number;
}

export interface Wager {
  id: string;
  userId: string;
  propId: string;
  optionId: string;
  amount: number;
  potentialPayout: number;
  status: 'active' | 'won' | 'lost' | 'cancelled';
  createdAt: Date;
  settledAt?: Date;
}

export interface CreatePropDto {
  title: string;
  description: string;
  category: 'game' | 'tournament' | 'player' | 'team';
  game?: string;
  options: Array<{
    title: string;
    odds: number;
  }>;
  closesAt: string; // ISO date string
}

export interface PlaceWagerDto {
  propId: string;
  optionId: string;
  amount: number;
}

@Injectable()
export class PropService {
  private readonly logger = new Logger(PropService.name);
  private props: Map<string, Prop> = new Map();
  private wagers: Map<string, Wager> = new Map();
  private userWagers: Map<string, string[]> = new Map();

  constructor(private readonly feeCalculator: FeeCalculatorService) {}

  /**
   * Create a new prop bet
   */
  async createProp(createPropDto: CreatePropDto): Promise<Prop> {
    const { title, description, category, game, options, closesAt } = createPropDto;

    if (options.length < 2) {
      throw new BadRequestException('Prop must have at least 2 options');
    }

    const prop: Prop = {
      id: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      category,
      game,
      options: options.map((opt, index) => ({
        id: `option_${index}`,
        title: opt.title,
        odds: opt.odds,
        totalWagered: 0,
        wagerCount: 0,
      })),
      status: 'open',
      totalWagered: 0,
      houseVig: 0,
      createdAt: new Date(),
      closesAt: new Date(closesAt),
    };

    this.props.set(prop.id, prop);
    this.logger.log(`Prop created: ${prop.id} - ${title}`);

    return prop;
  }

  /**
   * Get all open props
   */
  async getOpenProps(): Promise<Prop[]> {
    return Array.from(this.props.values())
      .filter(prop => prop.status === 'open' && prop.closesAt > new Date())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get prop by ID
   */
  async getProp(propId: string): Promise<Prop> {
    const prop = this.props.get(propId);
    if (!prop) {
      throw new NotFoundException('Prop not found');
    }
    return prop;
  }

  /**
   * Place a wager on a prop
   */
  async placeWager(userId: string, placeWagerDto: PlaceWagerDto): Promise<Wager> {
    const { propId, optionId, amount } = placeWagerDto;

    const prop = this.props.get(propId);
    if (!prop) {
      throw new NotFoundException('Prop not found');
    }

    if (prop.status !== 'open') {
      throw new BadRequestException('Prop is not open for wagering');
    }

    if (prop.closesAt <= new Date()) {
      throw new BadRequestException('Prop has closed');
    }

    const option = prop.options.find(opt => opt.id === optionId);
    if (!option) {
      throw new BadRequestException('Invalid option');
    }

    if (amount <= 0) {
      throw new BadRequestException('Wager amount must be greater than 0');
    }

    // Calculate house vig (15%)
    const vigCalculation = this.feeCalculator.calculatePropVig(amount);
    const netAmount = vigCalculation.netPayout;

    // Calculate potential payout
    const potentialPayout = netAmount * option.odds;

    const wager: Wager = {
      id: `wager_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      propId,
      optionId,
      amount,
      potentialPayout,
      status: 'active',
      createdAt: new Date(),
    };

    this.wagers.set(wager.id, wager);

    // Update prop statistics
    option.totalWagered += amount;
    option.wagerCount += 1;
    prop.totalWagered += amount;
    prop.houseVig += vigCalculation.vigAmount;

    // Track user's wagers
    if (!this.userWagers.has(userId)) {
      this.userWagers.set(userId, []);
    }
    this.userWagers.get(userId)!.push(wager.id);

    this.logger.log(`Wager placed: ${wager.id} by user ${userId} on ${prop.title}`);

    return wager;
  }

  /**
   * Get user's wagers
   */
  async getUserWagers(userId: string): Promise<Wager[]> {
    const wagerIds = this.userWagers.get(userId) || [];
    return wagerIds
      .map(id => this.wagers.get(id))
      .filter(wager => wager !== undefined) as Wager[];
  }

  /**
   * Settle a prop (determine winning option)
   */
  async settleProp(propId: string, winningOptionId: string): Promise<Prop> {
    const prop = this.props.get(propId);
    if (!prop) {
      throw new NotFoundException('Prop not found');
    }

    if (prop.status !== 'open') {
      throw new BadRequestException('Prop is not open');
    }

    const winningOption = prop.options.find(opt => opt.id === winningOptionId);
    if (!winningOption) {
      throw new BadRequestException('Invalid winning option');
    }

    // Update prop
    prop.status = 'settled';
    prop.winningOptionId = winningOptionId;
    prop.settledAt = new Date();

    // Settle all wagers
    const allWagers = Array.from(this.wagers.values())
      .filter(wager => wager.propId === propId);

    for (const wager of allWagers) {
      if (wager.optionId === winningOptionId) {
        wager.status = 'won';
        wager.settledAt = new Date();
      } else {
        wager.status = 'lost';
        wager.settledAt = new Date();
      }
    }

    this.logger.log(`Prop settled: ${propId} - Winner: ${winningOption.title}`);

    return prop;
  }

  /**
   * Get prop statistics
   */
  async getPropStats(): Promise<{
    totalProps: number;
    openProps: number;
    settledProps: number;
    totalWagered: number;
    totalHouseVig: number;
    averageWager: number;
  }> {
    const props = Array.from(this.props.values());
    const wagers = Array.from(this.wagers.values());

    return {
      totalProps: props.length,
      openProps: props.filter(p => p.status === 'open').length,
      settledProps: props.filter(p => p.status === 'settled').length,
      totalWagered: props.reduce((sum, p) => sum + p.totalWagered, 0),
      totalHouseVig: props.reduce((sum, p) => sum + p.houseVig, 0),
      averageWager: wagers.length > 0 
        ? wagers.reduce((sum, w) => sum + w.amount, 0) / wagers.length 
        : 0,
    };
  }

  /**
   * Calculate prop vig for display
   */
  calculatePropVig(wagerAmount: number) {
    return this.feeCalculator.calculatePropVig(wagerAmount);
  }
}





