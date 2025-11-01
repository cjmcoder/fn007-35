import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { FeeCalculatorService } from './fee-calculator.service';

@Injectable()
export class PayPalFeeService {
  private readonly logger = new Logger(PayPalFeeService.name);

  constructor(private readonly feeCalculator: FeeCalculatorService) {}

  /**
   * Create a deposit session with fee calculation
   * @param userId - User ID
   * @param requestedAmount - Amount user wants to deposit
   * @returns Deposit session with fee breakdown
   */
  async createDepositSession(userId: string, requestedAmount: number): Promise<{
    sessionId: string;
    userPays: number;
    fcReceived: number;
    feeBreakdown: {
      paypalFee: number;
      percentageFee: number;
      fixedFee: number;
    };
    minimumAmount: number;
  }> {
    // Validate minimum amount
    const minimumAmount = this.feeCalculator.getMinimumDepositAmount();
    if (requestedAmount < minimumAmount) {
      throw new BadRequestException(
        `Minimum deposit amount is $${minimumAmount} to cover PayPal fees`
      );
    }

    // Calculate fees
    const depositFees = this.feeCalculator.calculateDepositFees(requestedAmount);

    // Generate session ID (in real implementation, store in database)
    const sessionId = `deposit_${userId}_${Date.now()}`;

    this.logger.log(`Created deposit session: ${sessionId} for $${requestedAmount}`);

    return {
      sessionId,
      userPays: depositFees.userPays,
      fcReceived: depositFees.fcReceived,
      feeBreakdown: {
        paypalFee: depositFees.paypalFees.paypalFee,
        percentageFee: depositFees.paypalFees.feeBreakdown.percentageFee,
        fixedFee: depositFees.paypalFees.feeBreakdown.fixedFee,
      },
      minimumAmount,
    };
  }

  /**
   * Process a withdrawal request with fee calculation
   * @param userId - User ID
   * @param fcAmount - Amount to withdraw in FC
   * @returns Withdrawal request with fee breakdown
   */
  async createWithdrawalRequest(userId: string, fcAmount: number): Promise<{
    requestId: string;
    fcAmount: number;
    userReceives: number;
    feeBreakdown: {
      paypalFee: number;
      percentageFee: number;
      fixedFee: number;
    };
    minimumAmount: number;
  }> {
    // Validate minimum amount
    const minimumAmount = this.feeCalculator.getMinimumWithdrawalAmount();
    if (fcAmount < minimumAmount) {
      throw new BadRequestException(
        `Minimum withdrawal amount is ${minimumAmount} FC to cover PayPal fees`
      );
    }

    // Calculate fees
    const withdrawalFees = this.feeCalculator.calculateWithdrawalFees(fcAmount);

    // Generate request ID (in real implementation, store in database)
    const requestId = `withdrawal_${userId}_${Date.now()}`;

    this.logger.log(`Created withdrawal request: ${requestId} for ${fcAmount} FC`);

    return {
      requestId,
      fcAmount: withdrawalFees.fcAmount,
      userReceives: withdrawalFees.userReceives,
      feeBreakdown: {
        paypalFee: withdrawalFees.paypalFees.paypalFee,
        percentageFee: withdrawalFees.paypalFees.feeBreakdown.percentageFee,
        fixedFee: withdrawalFees.paypalFees.feeBreakdown.fixedFee,
      },
      minimumAmount,
    };
  }

  /**
   * Calculate match entry fees
   * @param matchAmount - Total match amount
   * @returns Match fee breakdown
   */
  calculateMatchFees(matchAmount: number): {
    totalAmount: number;
    matchFee: number;
    netAmount: number;
    feePercentage: number;
  } {
    const matchFees = this.feeCalculator.calculateMatchFees(matchAmount);

    return {
      totalAmount: matchFees.grossAmount,
      matchFee: matchFees.matchFee,
      netAmount: matchFees.netAmount,
      feePercentage: matchFees.feePercentage,
    };
  }

  /**
   * Calculate prop bet vig
   * @param wagerAmount - Wager amount
   * @returns Prop vig breakdown
   */
  calculatePropVig(wagerAmount: number): {
    wagerAmount: number;
    vigAmount: number;
    netPayout: number;
    vigPercentage: number;
  } {
    const propVig = this.feeCalculator.calculatePropVig(wagerAmount);

    return {
      wagerAmount: propVig.grossAmount,
      vigAmount: propVig.vigAmount,
      netPayout: propVig.netPayout,
      vigPercentage: propVig.vigPercentage,
    };
  }

  /**
   * Get fee structure information
   */
  getFeeStructure() {
    return this.feeCalculator.getFeeStructure();
  }

  /**
   * Simulate PayPal payment processing (for development)
   * @param sessionId - Deposit session ID
   * @param amount - Amount paid
   * @returns Processing result
   */
  async simulatePayPalPayment(sessionId: string, amount: number): Promise<{
    success: boolean;
    transactionId: string;
    amount: number;
    fees: number;
    netAmount: number;
  }> {
    // Simulate PayPal processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const depositFees = this.feeCalculator.calculateDepositFees(amount);
    const transactionId = `paypal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log(`Simulated PayPal payment: ${transactionId} for $${amount}`);

    return {
      success: true,
      transactionId,
      amount: depositFees.userPays,
      fees: depositFees.paypalFees.paypalFee,
      netAmount: depositFees.fcReceived,
    };
  }

  /**
   * Simulate PayPal payout processing (for development)
   * @param requestId - Withdrawal request ID
   * @param fcAmount - FC amount to withdraw
   * @returns Processing result
   */
  async simulatePayPalPayout(requestId: string, fcAmount: number): Promise<{
    success: boolean;
    transactionId: string;
    fcAmount: number;
    fees: number;
    netAmount: number;
  }> {
    // Simulate PayPal processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const withdrawalFees = this.feeCalculator.calculateWithdrawalFees(fcAmount);
    const transactionId = `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log(`Simulated PayPal payout: ${transactionId} for ${fcAmount} FC`);

    return {
      success: true,
      transactionId,
      fcAmount: withdrawalFees.fcAmount,
      fees: withdrawalFees.paypalFees.paypalFee,
      netAmount: withdrawalFees.userReceives,
    };
  }
}





