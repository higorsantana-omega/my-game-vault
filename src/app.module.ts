import { Module } from '@nestjs/common'
import { APP_GUARD, APP_PIPE } from '@nestjs/core'

import { ZodValidationPipe } from 'nestjs-zod'

import { DatabaseModule } from './shared/module/database/database.module'

import { AuthGuard } from './modules/auth/auth.guard'

import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { GamesModule } from './modules/games/games.module'

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, GamesModule],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }
  ]
})
export class AppModule {}
