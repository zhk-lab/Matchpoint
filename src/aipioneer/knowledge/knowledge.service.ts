import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { CreateSeniorDto } from './dto/create-senior.dto';
import { QueryEntryDto } from './dto/query-entry.dto';

@Injectable()
export class KnowledgeService {
  constructor(private readonly prisma: PrismaService) {}

  async createSenior(dto: CreateSeniorDto) {
    return this.prisma.seniorProfile.create({
      data: {
        name: dto.name.trim(),
        school: dto.school.trim(),
        major: dto.major?.trim(),
        graduationYear: dto.graduationYear,
        destination: dto.destination?.trim(),
        direction: dto.direction?.trim(),
        intro: dto.intro?.trim(),
      },
    });
  }

  async listSeniors(q?: string) {
    return this.prisma.seniorProfile.findMany({
      where: {
        deletedAt: null,
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { school: { contains: q, mode: 'insensitive' } },
                { major: { contains: q, mode: 'insensitive' } },
                { direction: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: [{ updatedAt: 'desc' }],
      take: 50,
    });
  }

  async createEntry(userId: number, dto: CreateEntryDto) {
    const senior = await this.prisma.seniorProfile.findUnique({
      where: { id: dto.seniorProfileId },
      select: { id: true, deletedAt: true },
    });
    if (!senior || senior.deletedAt) {
      throw new NotFoundException('师兄师姐画像不存在');
    }

    const normalizedTags = (dto.tags ?? [])
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const tagRecords = await Promise.all(
      [...new Set(normalizedTags)].map((tag) =>
        this.prisma.tag.upsert({
          where: { name: tag },
          update: {},
          create: { name: tag },
          select: { id: true },
        }),
      ),
    );

    return this.prisma.experienceEntry.create({
      data: {
        seniorProfileId: dto.seniorProfileId,
        title: dto.title.trim(),
        category: dto.category,
        content: dto.content.trim(),
        applicableTo: dto.applicableTo?.trim(),
        outcome: dto.outcome?.trim(),
        happenedAt: dto.happenedAt ? new Date(dto.happenedAt) : undefined,
        sourceNote: dto.sourceNote?.trim(),
        createdById: userId,
        tags: {
          create: tagRecords.map((tag) => ({
            tagId: tag.id,
          })),
        },
      },
      include: {
        seniorProfile: true,
        tags: { include: { tag: true } },
      },
    });
  }

  async queryEntries(dto: QueryEntryDto) {
    const limit = dto.limit ?? 12;
    const where: Prisma.ExperienceEntryWhereInput = {
      deletedAt: null,
      ...(dto.category ? { category: dto.category } : {}),
      ...(dto.seniorProfileId ? { seniorProfileId: dto.seniorProfileId } : {}),
      ...(dto.tag
        ? {
            tags: {
              some: {
                tag: {
                  name: {
                    equals: dto.tag,
                    mode: 'insensitive',
                  },
                },
              },
            },
          }
        : {}),
      ...(dto.q
        ? {
            OR: [
              { title: { contains: dto.q, mode: 'insensitive' } },
              { content: { contains: dto.q, mode: 'insensitive' } },
              { applicableTo: { contains: dto.q, mode: 'insensitive' } },
              { outcome: { contains: dto.q, mode: 'insensitive' } },
              { sourceNote: { contains: dto.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return this.prisma.experienceEntry.findMany({
      where,
      include: {
        seniorProfile: true,
        tags: { include: { tag: true } },
      },
      orderBy: [{ updatedAt: 'desc' }],
      take: limit,
    });
  }

  async listTags() {
    return this.prisma.tag.findMany({
      orderBy: [{ name: 'asc' }],
      take: 200,
    });
  }
}
