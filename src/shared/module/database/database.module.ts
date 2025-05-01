import { Global, Module } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { UsersRepository } from './repositories/users.repository'
import { GamesRepository } from './repositories/games.repository'

@Global()
@Module({
  providers: [PrismaService, UsersRepository, GamesRepository],
  exports: [UsersRepository, GamesRepository]
})
export class DatabaseModule {}
