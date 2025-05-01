import { Injectable } from '@nestjs/common'

import { type Prisma } from '@prisma/client'

import { PrismaService } from '../prisma.service'

import { Game, GameRating } from '@src/shared/entity/game.entity'

type QueryableFields = Prisma.GameWhereInput

@Injectable()
export class GamesRepository {
  private readonly model: PrismaService['game']

  constructor(prismaService: PrismaService) {
    this.model = prismaService.game
  }

  async findOneBy(fields: Partial<QueryableFields>): Promise<Game | null> {
    const game = await this.model.findFirst({
      where: fields
    })
    if (!game) return null

    return Game.createFrom({
      id: game.id,
      title: game.title,
      description: game.description as string,
      imageUrl: game.imageUrl,
      platforms: game.platforms || [],
      rating: {
        ...(game.rating as GameRating)
      },
      rawgId: game.rawgId as string,
      releaseDate: game.releaseDate,
      createdAt: game.createdAt as Date,
      updatedAt: game.updatedAt as Date
    })
  }

  async save(entity: Game): Promise<Game> {
    const game = await this.model.create({
      data: {
        ...entity.serialize(),
        releaseDate: new Date(entity.getReleaseDate() as Date),
        createdAt: new Date(entity.getCreatedAt() as Date),
        updatedAt: new Date(entity.getUpdatedAt() as Date)
      }
    })

    return Game.createFrom({
      id: game.id,
      title: game.title,
      description: game.description as string,
      imageUrl: game.imageUrl,
      platforms: game.platforms || [],
      rating: {
        ...(game.rating as GameRating)
      },
      rawgId: game.rawgId as string,
      releaseDate: game.releaseDate,
      createdAt: game.createdAt as Date,
      updatedAt: game.updatedAt as Date
    })
  }
}
