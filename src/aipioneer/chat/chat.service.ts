import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ChatRole } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AskDto } from './dto/ask.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ChatAiService } from './chat.ai.service';
import { ChatRetrievalService } from './chat.retrieval.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly retrievalService: ChatRetrievalService,
    private readonly aiService: ChatAiService,
  ) {}

  async createConversation(userId: number, dto: CreateConversationDto) {
    return this.prisma.conversation.create({
      data: {
        userId,
        title: dto.title?.trim() || null,
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
      },
      take: 100,
    });
  }

  async listMessages(userId: number, conversationId: number) {
    await this.assertConversationOwner(userId, conversationId);

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
    const question = dto.question.trim();

    await this.prisma.chatMessage.create({
      data: {
        conversationId,
        role: ChatRole.USER,
        content: question,
      },
    });

    const history = await this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: [{ createdAt: 'desc' }],
      take: 8,
    });

    const retrieval = await this.retrievalService.retrieve(question, 6);
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
    }

    return assistantMessage;
  }

  private async assertConversationOwner(userId: number, conversationId: number) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException('会话不存在');
    if (conversation.userId !== userId) throw new ForbiddenException('无权访问该会话');
    return conversation;
  }
}
