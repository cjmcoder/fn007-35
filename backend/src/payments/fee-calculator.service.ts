import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FeeCalculatorService {
  private readonly logger = new Logger(FeeCalculatorService.name);

  // PayPal fee structure: 2.9% + $0.30 per transaction
  private readonly PAYPAL_PERCENTAGE_FEE = 0.029; // 2.9%
  private readonly PAYPAL_FIXED_FEE = 0.30; // $0.30

  // Match fee: 10% of match total
  private readonly MATCH_FEE_PERCENTAGE = 0.10; // 10%

  // Prop bet house vig: 15% (high vig for house edge)
  private readonly PROP_VIG_PERCENTAGE = 0.15; // 15%

  /**
   * Calculate PayPal fees for a transaction
   * @param amount - Transaction amount in USD
   * @returns Object with gross amount, fees, and net amount
   */
  calculatePayPalFees(amount: number): {
    grossAmount: number;
    paypalFee: number;
    netAmount: number;
    feeBreakdown: {
      percentageFee: number;
      fixedFee: number;
      totalFee: number;
    };
  } {
    const percentageFee = amount * this.PAYPAL_PERCENTAGE_FEE;
    const fixedFee = this.PAYPAL_FIXED_FEE;
    const totalFee = percentageFee + fixedFee;
    const netAmount = amount - totalFee;

    this.logger.log(`PayPal fee calculation: $${amount} -> $${netAmount} (fee: $${totalFee.toFixed(2)})`);

    return {
      grossAmount: amount,
      paypalFee: totalFee,
      netAmount: Math.max(0, netAmount), // Ensure non-negative
      feeBreakdown: {
        percentageFee,
        fixedFee,
        totalFee,
      },
    };
  }

  /**
   * Calculate match fees (10% of match total)
   * @param matchAmount - Total match amount in FC
   * @returns Object with match fee and net amount
   */
  calculateMatchFees(matchAmount: number): {
    grossAmount: number;
    matchFee: number;
    netAmount: number;
    feePercentage: number;
  } {
    const matchFee = matchAmount * this.MATCH_FEE_PERCENTAGE;
    const netAmount = matchAmount - matchFee;

    this.logger.log(`Match fee calculation: ${matchAmount} FC -> ${netAmount} FC (fee: ${matchFee} FC)`);

    return {
      grossAmount: matchAmount,
      matchFee,
      netAmount: Math.max(0, netAmount),
      feePercentage: this.MATCH_FEE_PERCENTAGE,
    };
  }

  /**
   * Calculate prop bet house vig (15% vig)
   * @param wagerAmount - Wager amount in FC
   * @returns Object with vig amount and net payout
   */
  calculatePropVig(wagerAmount: number): {
    grossAmount: number;
    vigAmount: number;
    netPayout: number;
    vigPercentage: number;
  } {
    const vigAmount = wagerAmount * this.PROP_VIG_PERCENTAGE;
    const netPayout = wagerAmount - vigAmount;

    this.logger.log(`Prop vig calculation: ${wagerAmount} FC -> ${netPayout} FC (vig: ${vigAmount} FC)`);

    return {
      grossAmount: wagerAmount,
      vigAmount,
      netPayout: Math.max(0, netPayout),
      vigPercentage: this.PROP_VIG_PERCENTAGE,
    };
  }

  /**
   * Calculate total fees for a deposit
   * @param depositAmount - Amount user wants to deposit
   * @returns Object with all fee calculations
   */
  calculateDepositFees(depositAmount: number): {
    userPays: number;
    paypalFees: {
      grossAmount: number;
      paypalFee: number;
      netAmount: number;
      feeBreakdown: {
        percentageFee: number;
        fixedFee: number;
        totalFee: number;
      };
    };
    fcReceived: number;
  } {
    const paypalFees = this.calculatePayPalFees(depositAmount);
    
    // User pays the gross amount, we receive the net amount
    // FC received is 1:1 with net amount (minus any additional fees)
    const fcReceived = paypalFees.netAmount;

    this.logger.log(`Deposit calculation: User pays $${depositAmount} -> Receives ${fcReceived} FC`);

    return {
      userPays: depositAmount,
      paypalFees,
      fcReceived,
    };
  }

  /**
   * Calculate total fees for a withdrawal
   * @param fcAmount - Amount user wants to withdraw in FC
   * @returns Object with all fee calculations
   */
  calculateWithdrawalFees(fcAmount: number): {
    fcAmount: number;
    paypalFees: {
      grossAmount: number;
      paypalFee: number;
      netAmount: number;
      feeBreakdown: {
        percentageFee: number;
        fixedFee: number;
        totalFee: number;
      };
    };
    userReceives: number;
  } {
    // For withdrawals, we need to calculate how much USD to send
    // to cover PayPal fees so user receives the desired FC amount
    const paypalFees = this.calculatePayPalFees(fcAmount);
    const userReceives = paypalFees.netAmount;

    this.logger.log(`Withdrawal calculation: ${fcAmount} FC -> User receives $${userReceives}`);

    return {
      fcAmount,
      paypalFees,
      userReceives,
    };
  }

  /**
   * Calculate the minimum deposit amount to cover fees
   * @returns Minimum deposit amount in USD
   */
  getMinimumDepositAmount(): number {
    // Minimum to cover fixed fee + small amount for percentage fee
    return Math.ceil((this.PAYPAL_FIXED_FEE + 0.01) / (1 - this.PAYPAL_PERCENTAGE_FEE) * 100) / 100;
  }

  /**
   * Calculate the minimum withdrawal amount to cover fees
   * @returns Minimum withdrawal amount in FC
   */
  getMinimumWithdrawalAmount(): number {
    // Minimum to cover fixed fee + small amount for percentage fee
    return Math.ceil((this.PAYPAL_FIXED_FEE + 0.01) / (1 - this.PAYPAL_PERCENTAGE_FEE) * 100) / 100;
  }

  /**
   * Get fee structure information
   */
  getFeeStructure(): {
    paypal: {
      percentage: number;
      fixed: number;
      description: string;
    };
    match: {
      percentage: number;
      description: string;
    };
    propVig: {
      percentage: number;
      description: string;
    };
    minimums: {
      deposit: number;
      withdrawal: number;
    };
  } {
    return {
      paypal: {
        percentage: this.PAYPAL_PERCENTAGE_FEE,
        fixed: this.PAYPAL_FIXED_FEE,
        description: 'PayPal processing fee',
      },
      match: {
        percentage: this.MATCH_FEE_PERCENTAGE,
        description: 'Match entry fee',
      },
      propVig: {
        percentage: this.PROP_VIG_PERCENTAGE,
        description: 'Prop bet house vig',
      },
      minimums: {
        deposit: this.getMinimumDepositAmount(),
        withdrawal: this.getMinimumWithdrawalAmount(),
      },
    };
  }
}





