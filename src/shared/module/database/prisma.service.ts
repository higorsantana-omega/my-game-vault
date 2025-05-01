import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleDestroy,
  OnModuleInit
} from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { env } from '@src/shared/config/env'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy, OnApplicationShutdown
{
  private logger = new Logger(PrismaService.name)

  constructor() {
    super({
      datasources: {
        db: {
          url: env.DATABASE_URL
        }
      }
    })
  }

  async onModuleInit() {
    this.logger.log('Connecting to Prisma...')

    await this.$connect()
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from Prisma...')

    await this.$disconnect()
  }

  onApplicationShutdown(signal: string) {
    this.logger.log(`Application shutdown signal received: ${signal}`)
    this.$disconnect().catch((err) =>
      this.logger.error('Error during Prisma disconnection:', err)
    )
  }
}
