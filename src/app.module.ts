import { Module } from '@nestjs/common'
import { APP_PIPE } from '@nestjs/core'

import { ZodValidationPipe } from 'nestjs-zod'

import { DatabaseModule } from './shared/module/database/database.module'

import { AuthModule } from './modules/auth/auth.module'

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe
    }
  ]
})
export class AppModule {}
