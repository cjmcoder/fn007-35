import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthSimpleModule } from './health-simple/health-simple.module';
import { AuthDevModule } from './auth-dev/auth-dev.module';
import { PrismaDevModule } from './common/prisma-dev/prisma-dev.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['env.development', '.env'],
    }),
    PrismaDevModule,
    HealthSimpleModule,
    AuthDevModule,
  ],
})
export class AppDevModule {}





