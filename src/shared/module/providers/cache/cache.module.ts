import { Module } from '@nestjs/common'

import { CacheProvider } from './cache.provider'
import { RedisCacheProvider } from './redis/redis-cache-provider'
import { RedisService } from './redis/redis.service'

@Module({
  providers: [
    RedisService,
    {
      provide: CacheProvider,
      useClass: RedisCacheProvider
    }
  ],
  exports: [CacheProvider]
})
export class CacheModule {}
