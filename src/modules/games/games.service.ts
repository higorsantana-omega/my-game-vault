import { Injectable, Logger, NotFoundException } from '@nestjs/common'

import { GamesRepository } from '@src/shared/module/database/repositories/games.repository'

import { GameFilterDto, GameResponseDto } from './dto/games-filters.dto'
import { RawgApiProvider } from '@src/shared/module/providers/rawg-api.provider'
import { Game } from '@src/shared/entity/game.entity'
import { CacheProvider } from '@src/shared/module/providers/cache.provider'

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name)

  constructor(
    private readonly rawgApiProvider: RawgApiProvider,
    private readonly gamesRepository: GamesRepository,
    private readonly cacheProvider: CacheProvider
  ) {}

  async searchGames(gameFilterDto: GameFilterDto): Promise<GameResponseDto> {
    const gameFilters = {
      title: gameFilterDto?.filters?.title?.trim()?.toLowerCase(),
      platform: gameFilterDto?.filters?.platform?.trim()?.toLowerCase()
    }

    const cacheKey = `game:search:${Object.entries(gameFilters)
      .map(([key, value]) => `${key}=${value ?? ''}`)
      .join('&')}`

    const cacheHit = await this.cacheProvider.get<GameResponseDto>(cacheKey)
    if (cacheHit) {
      this.logger.log(`Game found in Cache Hit: ${JSON.stringify(gameFilters)}`)

      return cacheHit
    }

    const gameFromDb = await this.gamesRepository.findOneBy({
      title: gameFilters?.title ? { contains: gameFilters.title } : undefined,
      platforms: gameFilters?.platform
        ? {
            has: gameFilters.platform
          }
        : undefined
    })

    if (gameFromDb) {
      this.logger.log(
        `Game found in database for filters: ${JSON.stringify(gameFilters)}`
      )
      const result = this.mapGameToResponseDto(gameFromDb)

      await this.cacheProvider.set<GameResponseDto>(cacheKey, result, 10000)

      return result
    }

    this.logger.log(
      `Fetching game from RAWG API: ${JSON.stringify(gameFilters)}`
    )

    const rawgGames = await this.rawgApiProvider.searchGames({
      title: gameFilters.title,
      platformName: gameFilters.platform
    })

    if (!rawgGames || rawgGames.length === 0) {
      throw new NotFoundException(
        `No games found with title: ${gameFilterDto?.filters?.title || ''}`
      )
    }

    const rawgGame = rawgGames[0]

    const newGame = new Game({
      title: rawgGame.name,
      rawgId: String(rawgGame.id),
      description: '',
      releaseDate: new Date(rawgGame.released),
      platforms: rawgGame.platforms?.map((p) => p.platform.name) || [],
      imageUrl: rawgGame.background_image,
      rating: {
        value: rawgGame.rating,
        count: rawgGame.ratings_count
      }
    })

    const game = await this.gamesRepository.save(newGame)

    const result = this.mapGameToResponseDto(game)

    await this.cacheProvider.set<GameResponseDto>(cacheKey, result, 10000)

    return result
  }

  private mapGameToResponseDto(game: Game): GameResponseDto {
    const gameData = game.serialize()
    return {
      id: gameData.id as string,
      title: gameData.title,
      description: gameData.description ?? '',
      releaseDate: gameData.releaseDate?.toISOString().split('T')[0] as string,
      platforms: gameData.platforms,
      imageUrl: gameData.imageUrl,
      rating: gameData.rating
    }
  }
}
