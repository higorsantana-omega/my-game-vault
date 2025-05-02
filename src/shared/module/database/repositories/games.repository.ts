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

  async findAllPaginated(
    fields?: Partial<QueryableFields>,
    pagination?: { page: number; limit: number }
  ): Promise<{ items: Game[]; total: number; totalPages: number }> {
    const { page = 1, limit = 10 } = pagination || {}
    const skip = (page - 1) * limit

    const [games, total] = await Promise.all([
      this.model.findMany({
        where: fields,
        skip,
        take: limit
      }),
      this.model.count({
        where: fields
      })
    ])

    const totalPages = Math.ceil(total / (pagination?.limit || 1))

    return {
      items: games.map((game) => {
        return Game.createFrom({
          id: game.id,
          title: game.title,
          description: game.description as string,
          imageUrl: game.imageUrl,
          platforms: game.platforms || [],
          rating: {
            ...(game.rating as GameRating)
          },
          rawgId: game.rawgId,
          releaseDate: game.releaseDate,
          createdAt: game.createdAt,
          updatedAt: game.updatedAt
        })
      }),
      total,
      totalPages
    }
  }

  async findAll(fields?: Partial<QueryableFields>): Promise<Game[]> {
    const games = await this.model.findMany({
      where: fields
    })
    return games.map((game) => {
      return Game.createFrom({
        id: game.id,
        title: game.title,
        description: game.description as string,
        imageUrl: game.imageUrl,
        platforms: game.platforms || [],
        rating: {
          ...(game.rating as GameRating)
        },
        rawgId: game.rawgId,
        releaseDate: game.releaseDate,
        createdAt: game.createdAt,
        updatedAt: game.updatedAt
      })
    })
  }

  async findOneBy(fields?: Partial<QueryableFields>): Promise<Game | null> {
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
      rawgId: game.rawgId,
      releaseDate: game.releaseDate,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt
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
      rawgId: game.rawgId,
      releaseDate: game.releaseDate,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt
    })
  }
}
