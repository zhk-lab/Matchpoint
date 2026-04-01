import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

@UseGuards(JwtAuthGuard)
@Controller('v1/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  getMyProfile(@CurrentUserId() userId: number) {
    return this.profileService.getMyProfile(userId);
  }

  @Put('me')
  updateMyProfile(@CurrentUserId() userId: number, @Body() dto: UpdateProfileDto) {
    return this.profileService.upsertMyProfile(userId, dto);
  }
}
