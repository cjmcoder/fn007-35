import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface CreateOrderDto {
  amount: number;
  currency: string;
  userId: string;
  fcAmount: number;
}

export interface PayPalOrder {
  id: string;
  approveUrl: string;
}

@Injectable()
export class PayPalService {
  private readonly logger = new Logger(PayPalService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly environment: string;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(private configService: ConfigService) {
    this.clientId = this.configService.get<string>('paypal.clientId');
    this.clientSecret = this.configService.get<string>('paypal.clientSecret');
    this.environment = this.configService.get<string>('paypal.environment');
  }

  async createOrder(dto: CreateOrderDto): Promise<PayPalOrder> {
    const { amount, currency, userId, fcAmount } = dto;

    try {
      await this.ensureAccessToken();

      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: (amount / 100).toFixed(2), // Convert cents to dollars
            },
            custom_id: userId,
            description: `${fcAmount} FC (FlockNode Credits)`,
          },
        ],
        application_context: {
          brand_name: 'FLOCKNODE',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${this.configService.get<string>('frontend.url')}/wallet/success`,
          cancel_url: `${this.configService.get<string>('frontend.url')}/wallet/cancel`,
        },
      };

      const response = await axios.post(
        `${this.getBaseUrl()}/v2/checkout/orders`,
        orderData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
            'PayPal-Request-Id': `flocknode-${userId}-${Date.now()}`,
          },
        }
      );

      const order = response.data;
      const approveUrl = order.links.find((link: any) => link.rel === 'approve')?.href;

      if (!approveUrl) {
        throw new Error('No approval URL found in PayPal order');
      }

      this.logger.log(`Created PayPal order: ${order.id}`);

      return {
        id: order.id,
        approveUrl,
      };
    } catch (error) {
      this.logger.error('Failed to create PayPal order:', error);
      throw error;
    }
  }

  async captureOrder(orderId: string): Promise<any> {
    try {
      await this.ensureAccessToken();

      const response = await axios.post(
        `${this.getBaseUrl()}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      this.logger.log(`Captured PayPal order: ${orderId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to capture PayPal order:', error);
      throw error;
    }
  }

  async verifyWebhookSignature(payload: any, signature: string): Promise<boolean> {
    try {
      // PayPal webhook verification would be implemented here
      // This is a simplified version - in production, you'd verify the signature
      // against PayPal's webhook signature verification endpoint
      
      this.logger.log('PayPal webhook signature verification (simplified)');
      return true;
    } catch (error) {
      this.logger.error('PayPal webhook signature verification failed:', error);
      return false;
    }
  }

  private async ensureAccessToken(): Promise<void> {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return;
    }

    try {
      const response = await axios.post(
        `${this.getBaseUrl()}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));

      this.logger.log('Refreshed PayPal access token');
    } catch (error) {
      this.logger.error('Failed to get PayPal access token:', error);
      throw error;
    }
  }

  private getBaseUrl(): string {
    return this.environment === 'live' 
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }
}





