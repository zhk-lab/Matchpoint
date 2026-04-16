import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateEntryDto } from './dto/create-entry.dto';
import { CreateSeniorDto } from './dto/create-senior.dto';
import { QueryEntryDto } from './dto/query-entry.dto';
import { KnowledgeService } from './knowledge.service';

@Controller('v1/knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get('seniors')
  listSeniors(@Query('q') q?: string) {
    return this.knowledgeService.listSeniors(q);
  }

  @UseGuards(JwtAuthGuard)
  @Post('seniors')
  createSenior(@CurrentUserId() userId: number, @Body() dto: CreateSeniorDto) {
    return this.knowledgeService.createSenior(userId, dto);
  }

  @Get('entries')
  queryEntries(@Query() dto: QueryEntryDto) {
    return this.knowledgeService.queryEntries(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('entries')
  createEntry(@CurrentUserId() userId: number, @Body() dto: CreateEntryDto) {
    return this.knowledgeService.createEntry(userId, dto);
  }

  @Get('tags')
  listTags() {
    return this.knowledgeService.listTags();
  }
}
