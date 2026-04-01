import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('用户不存在');

    const profile = await this.prisma.aiUserProfile.findUnique({
      where: { userId },
    });

    return { user, profile };
  }

  async upsertMyProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('用户不存在');

    const profile = await this.prisma.aiUserProfile.upsert({
      where: { userId },
      update: {
        school: dto.school,
        grade: dto.grade,
        major: dto.major,
        target: dto.target,
        tags: dto.tags ?? undefined,
        bio: dto.bio,
      },
      create: {
        userId,
        school: dto.school,
        grade: dto.grade,
        major: dto.major,
        target: dto.target,
        tags: dto.tags ?? [],
        bio: dto.bio,
      },
    });

    return profile;
  }
}
