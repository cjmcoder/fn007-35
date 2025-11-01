import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { KafkaService } from '../../common/kafka/kafka.service';
import { v4 as uuidv4 } from 'uuid';

export interface CreateProofTicketRequest {
  matchId: string;
  type: 'screenshot' | 'vod' | 'admin_log';
}

export interface CommitProofRequest {
  matchId: string;
  fileKey: string;
  type: 'screenshot' | 'vod' | 'admin_log';
}

@Injectable()
export class ProofService {
  private readonly logger = new Logger(ProofService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly kafka: KafkaService,
  ) {}

  /**
   * Create signed URL for proof upload
   */
  async createProofTicket(userId: string, request: CreateProofTicketRequest): Promise<{
    ticketId: string;
    signedUrl: string;
    expiresAt: string;
  }> {
    const { matchId, type } = request;

    // Get match
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (![match.hostId, match.oppId].includes(userId)) {
      throw new BadRequestException('You are not part of this match');
    }

    // Generate ticket
    const ticketId = uuidv4();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Store ticket in Redis
    const ticketKey = `proof:ticket:${ticketId}`;
    await this.redis.setex(ticketKey, 3600, JSON.stringify({
      matchId,
      userId,
      type,
      expiresAt: expiresAt.toISOString(),
    }));

    // Generate signed URL (mock implementation)
    const signedUrl = `https://storage.flocknode.com/proofs/${ticketId}?signature=mock_signature`;

    this.logger.log(`Created proof ticket ${ticketId} for match ${matchId}`);

    return {
      ticketId,
      signedUrl,
      expiresAt: expiresAt.toISOString(),
    };
  }

  /**
   * Commit proof after upload
   */
  async commitProof(userId: string, request: CommitProofRequest): Promise<{
    proofId: string;
    status: string;
  }> {
    const { matchId, fileKey, type } = request;

    // Get match
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (![match.hostId, match.oppId].includes(userId)) {
      throw new BadRequestException('You are not part of this match');
    }

    // Create proof record
    const proof = await this.prisma.proof.create({
      data: {
        matchId,
        userId,
        type,
        fileKey,
        fileUrl: `https://storage.flocknode.com/proofs/${fileKey}`,
      },
    });

    // Emit Kafka event
    await this.kafka.emit('proof.committed', {
      matchId,
      proofId: proof.id,
      userId,
      type,
      fileKey,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Committed proof ${proof.id} for match ${matchId}`);

    return {
      proofId: proof.id,
      status: 'committed',
    };
  }

  /**
   * Get proofs for a match
   */
  async getMatchProofs(matchId: string): Promise<any[]> {
    const proofs = await this.prisma.proof.findMany({
      where: { matchId },
      orderBy: { createdAt: 'desc' },
    });

    return proofs.map(proof => ({
      id: proof.id,
      type: proof.type,
      fileKey: proof.fileKey,
      fileUrl: proof.fileUrl,
      createdAt: proof.createdAt,
    }));
  }
}





