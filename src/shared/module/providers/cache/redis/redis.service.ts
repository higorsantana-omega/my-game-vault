import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit
} from '@nestjs/common'
import { Redis } from 'ioredis'
import { env } from '@src/shared/config/env'

@Injectable()
export class RedisService
  extends Redis
  implements OnModuleDestroy, OnModuleInit
{
  private logger = new Logger(RedisService.name)

  constructor() {
    super({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      db: env.REDIS_DB
    })
  }

  onModuleInit() {
    this.logger.log('Connecting to Redis...')
  }

  onModuleDestroy() {
    this.logger.log('Disconnecting from Redis...')

    return this.disconnect()
  }
}
