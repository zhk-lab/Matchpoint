import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UseSoftDelete } from './soft-delete.decorator';

@PrismaDecorator(UseSoftDelete('User'))
@PrismaDecorator(UseSoftDelete('SeniorProfile'))
@PrismaDecorator(UseSoftDelete('ExperienceEntry'))
export class PrismaClientExtended extends PrismaClient {
  withoutExtensions() {
    return this;
  }
}

export function PrismaDecorator(
  prismaWrapper: (client: PrismaClientExtended) => PrismaClientExtended,
) {
  return (
    constructor: typeof PrismaClientExtended,
  ): typeof PrismaClientExtended => {
    const cls = class {
      constructor() {
        const innerClient = new constructor();
        const client = prismaWrapper(innerClient);
        (client as any).withoutExtensions = () =>
          innerClient.withoutExtensions();
        return client;
      }
    };
    return cls as typeof PrismaClientExtended;
  };
}

@Injectable()
export class PrismaService
  extends PrismaClientExtended
  implements OnModuleInit
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      await this.$queryRaw`SELECT 1`;
    } catch (error) {
      this.logger.error(
        'Failed to connect to PostgreSQL. Check PRISMA_DATABASE_URL and ensure the database server is running.',
      );
      throw error;
    }
  }
}
