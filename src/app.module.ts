import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DBModule } from './database/database.module';
import { AgentModule } from './modules/agent.module';
import { UserModule } from './modules/user.module';

@Module({
  imports: [DBModule, AgentModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
