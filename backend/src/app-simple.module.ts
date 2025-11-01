import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthSimpleModule } from './health-simple/health-simple.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    HealthSimpleModule,
  ],
})
export class AppSimpleModule {}
