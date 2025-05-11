import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AgentEntity } from 'src/database/entities/agent.entity';
import { UserEntity } from 'src/database/entities/user.entity';
import Stripe from 'stripe';
import { In, Repository } from 'typeorm';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(AgentEntity)
    private readonly agentsRepo: Repository<AgentEntity>,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error(
        'Stripe secret key is not defined in environment variables',
      );
    }
    this.stripe = new Stripe(stripeSecretKey);
  }

  async createCheckoutSession(
    amount: number,
    agentId: string[],
    userId: string,
  ) {
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const backendUrl = this.configService.get<string>('BACKEND_URL');

      if (!frontendUrl || !backendUrl) {
        throw new Error(
          'FRONTEND_URL or BACKEND_URL not defined in environment variables',
        );
      }

      const parsedAgentIds = JSON.stringify(agentId);

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
        metadata: {
          agentId: parsedAgentIds,
          userId,
        },
        success_url: `${frontendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/payment-failed`,
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
      const userId = session.metadata!.userId;
      const agentIds: string[] = JSON.parse(session.metadata!.agentId);
      console.log('Payment successful!');

      // Load user with existing owned_agents relationship
      const user = await this.userRepo.findOne({
        where: { id: userId },
        relations: ['owned_agents'],
      });

      if (!user) return session;

      const agents = await this.agentsRepo.find({
        where: { id: In(agentIds) },
      });

      // Initialize owned_agents array if it doesn't exist
      if (!user.owned_agents) {
        user.owned_agents = [];
      }

      user.owned_agents = [...user.owned_agents, ...agents];

      await this.userRepo.save(user);

      return session;
    } catch (error) {
      console.error('Error updating user owned agents:', error);
      throw new Error('Could not update user owned agents');
    }
  }
}
