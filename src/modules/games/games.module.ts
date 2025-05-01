import { Module } from '@nestjs/common'
import { GamesController } from './games.controller'
import { GamesService } from './games.service'
import { HttpModule } from '@nestjs/axios'
import { RawgApiProvider } from '@src/shared/module/providers/rawg-api.provider'

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5
    })
  ],
  controllers: [GamesController],
  providers: [GamesService, RawgApiProvider]
})
export class GamesModule {}
