import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProofService } from './proof.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

export class CreateProofTicketDto {
  matchId: string;
  type: 'screenshot' | 'vod' | 'admin_log';
}

export class CommitProofDto {
  matchId: string;
  fileKey: string;
  type: 'screenshot' | 'vod' | 'admin_log';
}

@ApiTags('Proof')
@Controller('proof')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProofController {
  constructor(private readonly proofService: ProofService) {}

  @Post('ticket')
  @ApiOperation({ summary: 'Create signed URL for proof upload' })
  @ApiResponse({ status: 201, description: 'Proof ticket created successfully' })
  async createProofTicket(@Request() req, @Body() createProofTicketDto: CreateProofTicketDto) {
    return this.proofService.createProofTicket(req.user.id, createProofTicketDto);
  }

  @Post('commit')
  @ApiOperation({ summary: 'Commit proof after upload' })
  @ApiResponse({ status: 201, description: 'Proof committed successfully' })
  async commitProof(@Request() req, @Body() commitProofDto: CommitProofDto) {
    return this.proofService.commitProof(req.user.id, commitProofDto);
  }

  @Get('match/:matchId')
  @ApiOperation({ summary: 'Get proofs for a match' })
  @ApiResponse({ status: 200, description: 'Proofs retrieved successfully' })
  async getMatchProofs(@Param('matchId') matchId: string) {
    return this.proofService.getMatchProofs(matchId);
  }
}





