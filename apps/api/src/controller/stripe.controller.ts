import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { StripeService } from '../service/stripe.service';

@Controller()
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  // Create Stripe checkout session
  @Post('pay/create-checkout-session')
  async createCheckoutSession(@Body() body, @Res() res) {
    const { amount, agentId, userId } = body;
    try {
      if (!amount || isNaN(amount)) {
        return res.status(400).json({ error: 'Invalid amount' });
      }
      const session = await this.stripeService.createCheckoutSession(
        amount,
        agentId,
        userId,
      );
      return res.json(session);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Handle success
  @Get('pay/success/checkout/session')
  async paymentSuccess(@Query('session_id') sessionId: string, @Res() res) {
    try {
      const session = await this.stripeService.handleSuccessSession(sessionId);
      return res.json({ success: true, session });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Handle failure
  @Get('pay/failed/checkout/session')
  paymentFailed(@Res() res) {
    return res.json({ success: false, message: 'Payment failed' });
  }
}
