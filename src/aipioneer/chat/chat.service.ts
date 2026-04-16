import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ChatRole } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AskDto } from './dto/ask.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ChatAiService } from './chat.ai.service';
import { ChatRetrievalService } from './chat.retrieval.service';
import { SendPrivateMessageDto } from './dto/send-private-message.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly retrievalService: ChatRetrievalService,
    private readonly aiService: ChatAiService,
  ) {}

  async createConversation(userId: number, dto: CreateConversationDto) {
    const seniorProfileId = this.parseSeniorProfileId(dto.seniorProfileId);
    let seniorProfileName: string | null = null;

    if (seniorProfileId) {
      const seniorProfile = await this.prisma.seniorProfile.findFirst({
        where: {
          id: seniorProfileId,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
        },
      });
      if (!seniorProfile) {
        throw new NotFoundException('学长学姐不存在');
      }
      seniorProfileName = seniorProfile.name;

      const existing = await this.prisma.conversation.findFirst({
        where: {
          userId,
          archivedAt: null,
          seniorProfileId,
        },
        include: {
          _count: {
            select: {
              messages: true,
            },
          },
          seniorProfile: {
            select: {
              id: true,
              name: true,
              school: true,
              direction: true,
              destination: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
        },
      });
      if (existing) {
        return existing;
      }
    }

    return this.prisma.conversation.create({
      data: {
        userId,
        title:
          this.normalizeConversationTitle(dto.title) ??
          (seniorProfileName ? `与${seniorProfileName}私聊` : null),
        seniorProfileId: seniorProfileId ?? null,
      },
      include: {
        _count: {
          select: {
            messages: true,
          },
        },
        seniorProfile: {
          select: {
            id: true,
            name: true,
            school: true,
            direction: true,
            destination: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });
  }

  async listConversations(userId: number) {
    return this.prisma.conversation.findMany({
      where: { userId, archivedAt: null },
      orderBy: [{ updatedAt: 'desc' }],
      include: {
        _count: {
          select: { messages: true },
        },
        seniorProfile: {
          select: {
            id: true,
            name: true,
            school: true,
            direction: true,
            destination: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
      take: 100,
    });
  }

  async listPrivateInbox(userId: number) {
    return this.prisma.conversation.findMany({
      where: {
        archivedAt: null,
        seniorProfile: {
          ownerUserId: userId,
          deletedAt: null,
        },
      },
      orderBy: [{ updatedAt: 'desc' }],
      include: {
        _count: {
          select: { messages: true },
        },
        seniorProfile: {
          select: {
            id: true,
            name: true,
            school: true,
            direction: true,
            destination: true,
            ownerUserId: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
      take: 200,
    });
  }

  async listMessages(userId: number, conversationId: number) {
    await this.assertConversationMember(userId, conversationId);

    return this.prisma.chatMessage.findMany({
      where: { conversationId },
      include: {
        references: {
          include: {
            entry: {
              include: {
                seniorProfile: true,
                tags: {
                  include: { tag: true },
                },
              },
            },
          },
        },
      },
      orderBy: [{ createdAt: 'asc' }],
      take: 200,
    });
  }

  async ask(userId: number, conversationId: number, dto: AskDto) {
    const conversation = await this.assertConversationOwner(userId, conversationId);
    if (conversation.seniorProfileId) {
      throw new BadRequestException('私聊会话请使用私聊消息接口');
    }
    const question = dto.question.trim();

    await this.prisma.chatMessage.create({
      data: {
        conversationId,
        role: ChatRole.USER,
        content: question,
        senderUserId: userId,
      },
    });

    const history = await this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: [{ createdAt: 'desc' }],
      take: 8,
    });

    const retrieval = this.pickRetrievalEntries(
      await this.retrievalService.retrieve(question, conversation.seniorProfileId ? 14 : 6),
      conversation.seniorProfileId ?? undefined,
      6,
    );
    const aiResult = await this.aiService.answerWithContext({
      question,
      contextEntries: retrieval,
      history: history
        .reverse()
        .filter((item) => item.role === ChatRole.USER || item.role === ChatRole.ASSISTANT)
        .map((item) => ({
          role: item.role === ChatRole.USER ? ('user' as const) : ('assistant' as const),
          content: item.content,
        })),
    });

    const citationEntries = retrieval.slice(0, 4);

    const assistantMessage = await this.prisma.chatMessage.create({
      data: {
        conversationId,
        role: ChatRole.ASSISTANT,
        content: aiResult.content,
        model: aiResult.model,
        tokenUsage: aiResult.tokenUsage,
        contextSummary: aiResult.contextSummary,
        references: {
          create: citationEntries.map((item) => ({
            entryId: item.id,
            quote: item.content.slice(0, 220),
            reason: `按关键词与类别召回；score=${item.score}`,
          })),
        },
      },
      include: {
        references: {
          include: {
            entry: {
              include: {
                seniorProfile: true,
                tags: { include: { tag: true } },
              },
            },
          },
        },
      },
    });

    if (!conversation.title) {
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: { title: question.slice(0, 32) },
      });
    } else {
      await this.touchConversation(conversationId);
    }

    return assistantMessage;
  }

  async sendPrivateMessage(userId: number, conversationId: number, dto: SendPrivateMessageDto) {
    const conversation = await this.assertConversationMember(userId, conversationId);
    if (!conversation.seniorProfileId || !conversation.seniorProfile) {
      throw new BadRequestException('该会话不是私聊会话');
    }

    const content = dto.content.trim();
    if (!content) {
      throw new BadRequestException('消息内容不能为空');
    }
    const isUserSender = conversation.userId === userId;
    const isSeniorSender = conversation.seniorProfile.ownerUserId === userId;
    if (!isUserSender && !isSeniorSender) {
      throw new ForbiddenException('无权发送该私聊消息');
    }

    const message = await this.prisma.chatMessage.create({
      data: {
        conversationId,
        role: isUserSender ? ChatRole.USER : ChatRole.ASSISTANT,
        content,
        senderUserId: isUserSender ? userId : null,
        senderSeniorProfileId: isSeniorSender ? conversation.seniorProfileId : null,
      },
    });

    await this.touchConversation(conversationId);
    return message;
  }

  private async assertConversationOwner(userId: number, conversationId: number) {
    const conversation = await this.getConversationWithAccessContext(conversationId);
    if (!conversation) throw new NotFoundException('会话不存在');
    if (conversation.userId !== userId) throw new ForbiddenException('无权访问该会话');
    return conversation;
  }

  private async assertConversationMember(userId: number, conversationId: number) {
    const conversation = await this.getConversationWithAccessContext(conversationId);
    if (!conversation) throw new NotFoundException('会话不存在');
    const isOwner = conversation.userId === userId;
    const isSeniorOwner = conversation.seniorProfile?.ownerUserId === userId;
    if (!isOwner && !isSeniorOwner) throw new ForbiddenException('无权访问该会话');
    return conversation;
  }

  private async getConversationWithAccessContext(conversationId: number) {
    return this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        seniorProfile: {
          select: {
            id: true,
            ownerUserId: true,
            name: true,
            school: true,
            direction: true,
            destination: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });
  }

  private parseSeniorProfileId(raw: number | undefined): number | undefined {
    if (typeof raw !== 'number' || !Number.isInteger(raw) || raw <= 0) {
      return undefined;
    }
    return raw;
  }

  private normalizeConversationTitle(raw?: string): string | null {
    const normalized = raw?.trim();
    return normalized ? normalized.slice(0, 160) : null;
  }

  private pickRetrievalEntries<T extends { seniorProfile: { id: number } }>(
    entries: T[],
    seniorProfileId: number | undefined,
    topK: number,
  ): T[] {
    if (!seniorProfileId) {
      return entries.slice(0, topK);
    }
    const privateMatches = entries.filter((entry) => entry.seniorProfile.id === seniorProfileId);
    if (privateMatches.length > 0) {
      return privateMatches.slice(0, topK);
    }
    return entries.slice(0, topK);
  }

  private async touchConversation(conversationId: number) {
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        updatedAt: new Date(),
      },
    });
  }
}
