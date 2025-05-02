import { Module } from '@nestjs/common'
import { GamesController } from './games.controller'
import { GamesService } from './games.service'
import { CacheModule } from '@src/shared/module/providers/cache/cache.module'
import { GamesDatabaseModule } from '@src/shared/module/providers/games-database/games-database.module'

@Module({
  imports: [CacheModule, GamesDatabaseModule],
  controllers: [GamesController],
  providers: [GamesService]
})
export class GamesModule {}
