// import { Controller, Get, Post, Body, Res, Param } from '@nestjs/common';
// import { StripeService } from '../service/stripe.service';

// @Controller()
// export class AppController {
//   constructor(private readonly stripeService: StripeService) {}

//   // Route to create a new checkout session
//   @Post('pay/create-checkout-session')
//   async createCheckoutSession(@Body() body, @Res() res) {
//     const { amount } = body; // Get the amount from the request body
//     try {
//       const session = await this.stripeService.createCheckoutSession(amount);
//       return res.json(session); // Return the session data
//     } catch (error) {
//       return res.status(500).json({ error: error.message });
//     }
//   }

//   // Route to handle payment success
//   @Get('pay/success/checkout/session')
//   async paymentSuccess(@Param('session_id') sessionId: string, @Res() res) {
//     try {
//       // Retrieve the session from Stripe
//       const session = await this.stripeService.handleSuccessSession(sessionId);
//       // Optionally store the session info in your database or handle other business logic
//       return res.json({ success: true, session });
//     } catch (error) {
//       return res.status(500).json({ error: error.message });
//     }
//   }

//   // Route to handle payment failure (if needed)
//   @Get('pay/failed/checkout/session')
//   paymentFailed(@Res() res) {
//     return res.json({ success: false, message: 'Payment failed' });
//   }
// }


import { Controller, Get, Post, Body, Res, Query } from '@nestjs/common';
import { StripeService } from '../service/stripe.service';

@Controller()
export class AppController {
  constructor(private readonly stripeService: StripeService) {}

  // Create Stripe checkout session
  @Post('pay/create-checkout-session')
  async createCheckoutSession(@Body() body, @Res() res) {
    const { amount } = body;
    try {
      if (!amount || isNaN(amount)) {
        return res.status(400).json({ error: 'Invalid amount' });
      }
      const session = await this.stripeService.createCheckoutSession(amount);
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

