import { Module } from '@nestjs/common';
import { HealthSimpleController } from './health-simple.controller';

@Module({
  controllers: [HealthSimpleController],
})
export class HealthSimpleModule {}





