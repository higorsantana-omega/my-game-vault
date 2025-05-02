import { Module } from '@nestjs/common'
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'

import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod'

import { DatabaseModule } from './shared/module/database/database.module'

import { AuthGuard } from './modules/auth/auth.guard'

import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { GamesModule } from './modules/games/games.module'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 20
        }
      ]
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    GamesModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
