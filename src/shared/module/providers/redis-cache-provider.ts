/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, Logger } from '@nestjs/common'
import { CacheProvider } from './cache.provider'
import { RedisService } from './redis.service'

@Injectable()
export class RedisCacheProvider implements CacheProvider {
  private readonly logger = new Logger(RedisCacheProvider.name)

  constructor(private redis: RedisService) {}

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(value))
      await this.redis.expire(key, ttl)
    } catch (error) {
      this.logger.error(`Error setting key ${key} in Redis cache`)
      this.logger.error(error)
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key)
      if (!data) {
        return null
      }
      return JSON.parse(data as any) as T
    } catch (error) {
      this.logger.error(`Error fetching key ${key} from Redis cache`)
      this.logger.error(error)
      return null
    }
  }

  async delete(key: string): Promise<void> {
    const keys = await this.redis.keys(`${key}*`)

    if (keys.length > 0) {
      await this.redis.del(...keys)
      this.logger.log(`Deleted keys: ${keys.join(', ')}`)
    }
  }
}
