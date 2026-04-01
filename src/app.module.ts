import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './aipioneer/auth/auth.module';
import { ChatModule } from './aipioneer/chat/chat.module';
import { KnowledgeModule } from './aipioneer/knowledge/knowledge.module';
import { ProfileModule } from './aipioneer/profile/profile.module';
import { PrismaModule } from './common/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ProfileModule,
    KnowledgeModule,
    ChatModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'web'),
      exclude: ['/api*'],
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    },
  ],
})
export class AppModule {}
