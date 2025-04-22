import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { AppModule } from './app.module';

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;

  await app.listen(port, () => {
    Logger.log(`listening at http://localhost:${port}`);
  });
}
bootstrap();
