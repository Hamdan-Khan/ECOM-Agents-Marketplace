import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key is not defined in environment variables');
    }
    this.stripe = new Stripe(stripeSecretKey);
  }

  async createCheckoutSession(amount: number) {
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const backendUrl = this.configService.get<string>('BACKEND_URL');

      if (!frontendUrl || !backendUrl) {
        throw new Error('FRONTEND_URL or BACKEND_URL not defined in environment variables');
      }

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: { name: 'Sample Product' },
              unit_amount: amount * 100,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${backendUrl}/pay/success/checkout/session?session_id={CHECKOUT_SESSION_ID}`,
        // success_url: `${frontendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/payment-failed`, // Example: show failed UI page
      });

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Could not create checkout session');
    }
  }

  async handleSuccessSession(sessionId: string) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      console.log('Payment successful:', session);
      return session;
    } catch (error) {
      console.error('Error retrieving session:', error);
      throw new Error('Could not retrieve session');
    }
  }
}
