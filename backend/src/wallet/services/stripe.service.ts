import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export interface CreateCheckoutSessionDto {
  amount: number;
  currency: string;
  userId: string;
  fcAmount: number;
}

export interface CheckoutSession {
  id: string;
  url: string;
}

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get<string>('stripe.secretKey'),
      {
        apiVersion: '2023-10-16',
      }
    );
  }

  async createCheckoutSession(dto: CreateCheckoutSessionDto): Promise<CheckoutSession> {
    const { amount, currency, userId, fcAmount } = dto;

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: 'FLOCKNODE Credits',
                description: `${fcAmount} FC (FlockNode Credits)`,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${this.configService.get<string>('frontend.url')}/wallet/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${this.configService.get<string>('frontend.url')}/wallet/cancel`,
        metadata: {
          userId,
          fcAmount: fcAmount.toString(),
        },
        customer_email: await this.getUserEmail(userId),
      });

      this.logger.log(`Created Stripe checkout session: ${session.id}`);

      return {
        id: session.id,
        url: session.url!,
      };
    } catch (error) {
      this.logger.error('Failed to create Stripe checkout session:', error);
      throw error;
    }
  }

  async verifyWebhookSignature(payload: any, signature: string): Promise<boolean> {
    try {
      const webhookSecret = this.configService.get<string>('stripe.webhookSecret');
      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      
      this.logger.log(`Verified Stripe webhook: ${event.type}`);
      return true;
    } catch (error) {
      this.logger.error('Stripe webhook signature verification failed:', error);
      return false;
    }
  }

  async getSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.retrieve(sessionId);
  }

  async createPaymentIntent(amount: number, currency: string, metadata: any): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
    });
  }

  private async getUserEmail(userId: string): Promise<string> {
    // This would typically fetch from your user service
    // For now, return a placeholder
    return `user-${userId}@flocknode.com`;
  }
}





