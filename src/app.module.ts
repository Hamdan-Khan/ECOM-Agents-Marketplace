import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DBModule } from './database/database.module';
import { AgentModule } from './modules/agent.module';
import { OrderModule } from './modules/order.module';
import { PaymentModule } from './modules/payment.module';
import { UserModule } from './modules/user.module';

@Module({
  imports: [DBModule, AgentModule, UserModule, OrderModule, PaymentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
