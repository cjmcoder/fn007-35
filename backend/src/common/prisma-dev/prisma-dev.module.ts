import { Global, Module } from '@nestjs/common';
import { PrismaDevService } from './prisma-dev.service';

@Global()
@Module({
  providers: [PrismaDevService],
  exports: [PrismaDevService],
})
export class PrismaDevModule {}





