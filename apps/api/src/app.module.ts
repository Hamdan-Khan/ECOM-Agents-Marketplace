import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DBModule } from './database/database.module';
import { AgentModule } from './modules/agent.module';
import { OrderModule } from './modules/order.module';
import { PaymentModule } from './modules/payment.module';
import { ReviewModule } from './modules/review.module';
import { UserModule } from './modules/user.module';
import { StripeModule } from './modules/stripe.module'; // Import StripeModule to handle payment processing

@Module({
  imports: [
    DBModule,
    AgentModule,
    UserModule,
    OrderModule,
    PaymentModule,
    AuthModule,
    ReviewModule,
    StripeModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
