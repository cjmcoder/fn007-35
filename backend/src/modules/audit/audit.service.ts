import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface AuditLogData {
  actorId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: any;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: AuditLogData) {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: data.actorId,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          metadata: data.metadata,
        },
      });
    } catch (error) {
      // Log audit failures but don't throw to avoid breaking the main operation
      console.error('Audit log failed:', error);
    }
  }
}





