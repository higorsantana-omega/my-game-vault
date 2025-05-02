import { Module } from '@nestjs/common'

import { GameProvider } from './game.provider'
import { RawgApiProvider } from './rawg/rawg-api.provider'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5
    })
  ],
  providers: [
    {
      provide: GameProvider,
      useClass: RawgApiProvider
    }
  ],
  exports: [GameProvider]
})
export class GamesDatabaseModule {}
