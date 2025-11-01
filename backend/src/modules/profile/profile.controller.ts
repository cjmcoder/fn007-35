import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { LinkGamertagDto } from './dto/link-gamertag.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';

@ApiTags('Profile')
@Controller('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully', type: ProfileResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: any): Promise<ProfileResponseDto> {
    return this.profileService.getProfile(user.id);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully', type: ProfileResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    return this.profileService.updateProfile(user.id, updateProfileDto);
  }

  @Post('gamertag/link')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Link gamertag to profile' })
  @ApiResponse({ status: 200, description: 'Gamertag linked successfully', type: ProfileResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async linkGamertag(
    @CurrentUser() user: any,
    @Body() linkGamertagDto: LinkGamertagDto,
  ): Promise<ProfileResponseDto> {
    return this.profileService.linkGamertag(user.id, linkGamertagDto);
  }

  @Delete('gamertag/:platform')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlink gamertag from profile' })
  @ApiResponse({ status: 200, description: 'Gamertag unlinked successfully', type: ProfileResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async unlinkGamertag(
    @CurrentUser() user: any,
    @Param('platform') platform: string,
  ): Promise<ProfileResponseDto> {
    return this.profileService.unlinkGamertag(user.id, platform);
  }
}





