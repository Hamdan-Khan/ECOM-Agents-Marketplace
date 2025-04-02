import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  canIGetaKiss(): string {
    return 'RM 4 LIFE';
  }
}
