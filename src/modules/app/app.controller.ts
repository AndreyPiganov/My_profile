import { Controller, Get } from '@nestjs/common';
import { AppService, ApplicationInfo } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getInfo(): ApplicationInfo {
    return this.appService.getInfo();
  }

  @Get('health')
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}
