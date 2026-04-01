import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AskDto } from './dto/ask.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ChatService } from './chat.service';

@UseGuards(JwtAuthGuard)
@Controller('v1/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  createConversation(
    @CurrentUserId() userId: number,
    @Body() dto: CreateConversationDto,
  ) {
    return this.chatService.createConversation(userId, dto);
  }

  @Get('conversations')
  listConversations(@CurrentUserId() userId: number) {
    return this.chatService.listConversations(userId);
  }

  @Get('conversations/:conversationId/messages')
  listMessages(
    @CurrentUserId() userId: number,
    @Param('conversationId', ParseIntPipe) conversationId: number,
  ) {
    return this.chatService.listMessages(userId, conversationId);
  }

  @Post('conversations/:conversationId/ask')
  ask(
    @CurrentUserId() userId: number,
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Body() dto: AskDto,
  ) {
    return this.chatService.ask(userId, conversationId, dto);
  }
}
