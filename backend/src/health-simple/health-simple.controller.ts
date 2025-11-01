import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthSimpleController {
  @Get()
  async getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'flocknode-backend',
      version: '1.0.0',
    };
  }

  @Get('ready')
  async getReady() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('live')
  async getLive() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}





