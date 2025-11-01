import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthMinimalController } from './auth-minimal.controller';
import { AuthMinimalService } from './auth-minimal.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthMinimalController],
  providers: [AuthMinimalService],
  exports: [AuthMinimalService],
})
export class AuthMinimalModule {}





