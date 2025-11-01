import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { LinkGamertagDto } from './dto/link-gamertag.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async ensureProfile(userId: string) {
    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      await this.prisma.profile.create({
        data: {
          userId,
          displayName: null,
          avatarUrl: null,
          bio: null,
          country: null,
          timezone: null,
          rank: 1000,
          trustScore: 100,
          psn: null,
          xbox: null,
          steam: null,
        },
      });
    }
  }

  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            roles: true,
            trustScore: true,
            tfaEnabled: true,
            isBanned: true,
            lastLoginAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return {
      id: profile.id,
      userId: profile.userId,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      country: profile.country,
      timezone: profile.timezone,
      rank: profile.rank,
      trustScore: profile.trustScore,
      psn: profile.psn,
      xbox: profile.xbox,
      steam: profile.steam,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      user: profile.user,
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<ProfileResponseDto> {
    const { displayName, avatarUrl, bio, country, timezone } = updateProfileDto;

    // Validate timezone if provided
    if (timezone && !this.isValidTimezone(timezone)) {
      throw new BadRequestException('Invalid timezone');
    }

    // Validate country if provided
    if (country && !this.isValidCountry(country)) {
      throw new BadRequestException('Invalid country code');
    }

    const profile = await this.prisma.profile.update({
      where: { userId },
      data: {
        displayName,
        avatarUrl,
        bio,
        country,
        timezone,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            roles: true,
            trustScore: true,
            tfaEnabled: true,
            isBanned: true,
            lastLoginAt: true,
            createdAt: true,
          },
        },
      },
    });

    // Log profile update
    await this.auditService.log({
      actorId: userId,
      action: 'PROFILE_UPDATED',
      entity: 'PROFILE',
      entityId: profile.id,
      metadata: { displayName, avatarUrl, bio, country, timezone },
    });

    return {
      id: profile.id,
      userId: profile.userId,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      country: profile.country,
      timezone: profile.timezone,
      rank: profile.rank,
      trustScore: profile.trustScore,
      psn: profile.psn,
      xbox: profile.xbox,
      steam: profile.steam,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      user: profile.user,
    };
  }

  async linkGamertag(userId: string, linkGamertagDto: LinkGamertagDto): Promise<ProfileResponseDto> {
    const { platform, gamertag } = linkGamertagDto;

    // Validate platform
    if (!['psn', 'xbox', 'steam'].includes(platform)) {
      throw new BadRequestException('Invalid platform. Must be psn, xbox, or steam');
    }

    // Validate gamertag format
    if (!this.isValidGamertag(platform, gamertag)) {
      throw new BadRequestException('Invalid gamertag format for platform');
    }

    // Check if gamertag is already linked to another user
    const existingProfile = await this.prisma.profile.findFirst({
      where: {
        [platform]: gamertag,
        userId: { not: userId },
      },
    });

    if (existingProfile) {
      throw new BadRequestException('Gamertag is already linked to another user');
    }

    const profile = await this.prisma.profile.update({
      where: { userId },
      data: {
        [platform]: gamertag,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            roles: true,
            trustScore: true,
            tfaEnabled: true,
            isBanned: true,
            lastLoginAt: true,
            createdAt: true,
          },
        },
      },
    });

    // Log gamertag link
    await this.auditService.log({
      actorId: userId,
      action: 'GAMERTAG_LINKED',
      entity: 'PROFILE',
      entityId: profile.id,
      metadata: { platform, gamertag },
    });

    return {
      id: profile.id,
      userId: profile.userId,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      country: profile.country,
      timezone: profile.timezone,
      rank: profile.rank,
      trustScore: profile.trustScore,
      psn: profile.psn,
      xbox: profile.xbox,
      steam: profile.steam,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      user: profile.user,
    };
  }

  async unlinkGamertag(userId: string, platform: string): Promise<ProfileResponseDto> {
    // Validate platform
    if (!['psn', 'xbox', 'steam'].includes(platform)) {
      throw new BadRequestException('Invalid platform. Must be psn, xbox, or steam');
    }

    const profile = await this.prisma.profile.update({
      where: { userId },
      data: {
        [platform]: null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            roles: true,
            trustScore: true,
            tfaEnabled: true,
            isBanned: true,
            lastLoginAt: true,
            createdAt: true,
          },
        },
      },
    });

    // Log gamertag unlink
    await this.auditService.log({
      actorId: userId,
      action: 'GAMERTAG_UNLINKED',
      entity: 'PROFILE',
      entityId: profile.id,
      metadata: { platform },
    });

    return {
      id: profile.id,
      userId: profile.userId,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      country: profile.country,
      timezone: profile.timezone,
      rank: profile.rank,
      trustScore: profile.trustScore,
      psn: profile.psn,
      xbox: profile.xbox,
      steam: profile.steam,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      user: profile.user,
    };
  }

  private isValidTimezone(timezone: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  }

  private isValidCountry(country: string): boolean {
    // Basic country code validation (2-letter ISO codes)
    return /^[A-Z]{2}$/.test(country);
  }

  private isValidGamertag(platform: string, gamertag: string): boolean {
    switch (platform) {
      case 'psn':
        // PSN: 3-16 characters, alphanumeric, hyphens, underscores
        return /^[a-zA-Z0-9_-]{3,16}$/.test(gamertag);
      case 'xbox':
        // Xbox: 1-15 characters, alphanumeric, spaces, hyphens
        return /^[a-zA-Z0-9\s-]{1,15}$/.test(gamertag);
      case 'steam':
        // Steam: 3-32 characters, alphanumeric, hyphens, underscores
        return /^[a-zA-Z0-9_-]{3,32}$/.test(gamertag);
      default:
        return false;
    }
  }
}





