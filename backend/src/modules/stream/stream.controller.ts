import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StreamService } from './stream.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

export class LinkStreamDto {
  matchId: string;
  side: 'p1' | 'p2';
  provider: 'TWITCH' | 'YOUTUBE' | 'KICK';
  channelId: string;
}

export class CheckStreamDto {
  matchId: string;
}

@ApiTags('Stream')
@Controller('stream')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Post('link')
  @ApiOperation({ summary: 'Link stream for VERIFIED_STREAM mode' })
  @ApiResponse({ status: 200, description: 'Stream linked successfully' })
  async linkStream(@Request() req, @Body() linkStreamDto: LinkStreamDto) {
    return this.streamService.linkStream(req.user.id, linkStreamDto);
  }

  @Post('check')
  @ApiOperation({ summary: 'Check stream status and update checklist' })
  @ApiResponse({ status: 200, description: 'Stream status checked successfully' })
  async checkStream(@Body() checkStreamDto: CheckStreamDto) {
    return this.streamService.checkStream(checkStreamDto);
  }
}