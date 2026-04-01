import { Injectable } from '@nestjs/common';
import { ExperienceCategory, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

type RetrievedEntry = {
  id: number;
  title: string;
  category: ExperienceCategory;
  content: string;
  applicableTo: string | null;
  outcome: string | null;
  sourceNote: string | null;
  seniorProfile: {
    id: number;
    name: string;
    school: string;
    direction: string | null;
  };
  tags: string[];
  score: number;
};

@Injectable()
export class ChatRetrievalService {
  constructor(private readonly prisma: PrismaService) {}

  async retrieve(question: string, topK: number = 6): Promise<RetrievedEntry[]> {
    const normalizedQuestion = question.trim();
    const keywords = this.extractKeywords(normalizedQuestion);
    const inferredCategory = this.inferCategory(normalizedQuestion);

    const where: Prisma.ExperienceEntryWhereInput = {
      deletedAt: null,
      ...(inferredCategory ? { category: inferredCategory } : {}),
      OR: this.buildKeywordConditions(keywords),
    };

    const raw = await this.prisma.experienceEntry.findMany({
      where,
      include: {
        seniorProfile: {
          select: {
            id: true,
            name: true,
            school: true,
            direction: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      take: 30,
      orderBy: [{ updatedAt: 'desc' }],
    });

    const scored = raw.map((entry) => {
      const score = this.scoreEntry(entry, keywords, inferredCategory);
      return {
        id: entry.id,
        title: entry.title,
        category: entry.category,
        content: entry.content,
        applicableTo: entry.applicableTo,
        outcome: entry.outcome,
        sourceNote: entry.sourceNote,
        seniorProfile: entry.seniorProfile,
        tags: entry.tags.map((rel) => rel.tag.name),
        score,
      };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  private buildKeywordConditions(keywords: string[]): Prisma.ExperienceEntryWhereInput[] {
    if (keywords.length === 0) {
      return [{ content: { contains: '' } }];
    }

    const conditions: Prisma.ExperienceEntryWhereInput[] = [];
    for (const keyword of keywords) {
      conditions.push({ title: { contains: keyword, mode: 'insensitive' } });
      conditions.push({ content: { contains: keyword, mode: 'insensitive' } });
      conditions.push({ applicableTo: { contains: keyword, mode: 'insensitive' } });
      conditions.push({ outcome: { contains: keyword, mode: 'insensitive' } });
      conditions.push({
        tags: {
          some: {
            tag: {
              name: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
          },
        },
      });
    }
    return conditions;
  }

  private extractKeywords(text: string): string[] {
    const base = text
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .map((item) => item.trim())
      .filter((item) => item.length >= 2);

    // For short Chinese terms like "保研", "实习", keep the original phrase.
    if (text.length <= 8 && text.trim().length > 0) {
      base.push(text.trim());
    }

    return [...new Set(base)].slice(0, 12);
  }

  private inferCategory(text: string): ExperienceCategory | undefined {
    const source = text.toLowerCase();
    if (source.includes('实习') || source.includes('intern')) {
      return ExperienceCategory.INTERNSHIP;
    }
    if (
      source.includes('保研') ||
      source.includes('推免') ||
      source.includes('graduate recommendation')
    ) {
      return ExperienceCategory.GRADUATE_RECOMMENDATION;
    }
    if (source.includes('规划') || source.includes('career') || source.includes('方向')) {
      return ExperienceCategory.CAREER_PLANNING;
    }
    if (source.includes('科研') || source.includes('research')) {
      return ExperienceCategory.RESEARCH;
    }
    if (source.includes('求职') || source.includes('面试') || source.includes('job')) {
      return ExperienceCategory.JOB_HUNT;
    }
    return undefined;
  }

  private scoreEntry(
    entry: {
      title: string;
      content: string;
      applicableTo: string | null;
      outcome: string | null;
      tags: { tag: { name: string } }[];
      category: ExperienceCategory;
    },
    keywords: string[],
    inferredCategory?: ExperienceCategory,
  ): number {
    const title = entry.title.toLowerCase();
    const content = entry.content.toLowerCase();
    const applicableTo = entry.applicableTo?.toLowerCase() ?? '';
    const outcome = entry.outcome?.toLowerCase() ?? '';
    const tags = entry.tags.map((item) => item.tag.name.toLowerCase());

    let score = 0;
    for (const rawKeyword of keywords) {
      const keyword = rawKeyword.toLowerCase();
      if (title.includes(keyword)) score += 3;
      if (content.includes(keyword)) score += 2;
      if (applicableTo.includes(keyword)) score += 1;
      if (outcome.includes(keyword)) score += 1;
      if (tags.some((tag) => tag.includes(keyword))) score += 2;
    }

    if (inferredCategory && inferredCategory === entry.category) {
      score += 2;
    }

    return score;
  }
}
