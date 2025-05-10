import { Module } from '@nestjs/common';
import { AppController } from '../controller/stripe.controller';
import { StripeService  } from '../service/stripe.service';
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule to load .env variables

@Module({
  imports: [ConfigModule.forRoot()], // Load .env variables
  controllers: [AppController],
  providers: [StripeService ],
})
export class StripeModule {}
