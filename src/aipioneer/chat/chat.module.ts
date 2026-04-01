import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ChatAiService } from './chat.ai.service';
import { ChatController } from './chat.controller';
import { ChatRetrievalService } from './chat.retrieval.service';
import { ChatService } from './chat.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ChatController],
  providers: [ChatService, ChatRetrievalService, ChatAiService],
})
export class ChatModule {}
