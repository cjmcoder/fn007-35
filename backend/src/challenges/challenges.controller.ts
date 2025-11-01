import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { z } from 'zod';
import { ChallengesService } from './challenges.service';
import { CreateChallengeSchema } from './dto/challenge.dto';

@Controller('challenge')
export class ChallengesController {
  constructor(private svc: ChallengesService) {}

  @Get()
  list() { return this.svc.listOpen(); }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    const dto = CreateChallengeSchema.parse(body);
    return this.svc.create(req.user?.id ?? 'demo-user', dto);
  }

  @Post(':id/accept')
  accept(@Req() req: any, @Param('id') id: string) {
    return this.svc.accept(req.user?.id ?? 'demo-user', id);
  }

  @Post(':id/confirm')
  confirm(@Req() req: any, @Param('id') id: string) {
    return this.svc.confirm(req.user?.id ?? 'demo-user', id);
  }
}