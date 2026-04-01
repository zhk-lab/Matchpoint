import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AiAuthModule } from '../auth/auth.module';
import { ChatAiService } from './chat.ai.service';
import { ChatController } from './chat.controller';
import { ChatRetrievalService } from './chat.retrieval.service';
import { ChatService } from './chat.service';

@Module({
  imports: [PrismaModule, AiAuthModule],
  controllers: [ChatController],
  providers: [ChatService, ChatRetrievalService, ChatAiService],
})
export class ChatModule {}
