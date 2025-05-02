import { Injectable, Logger, NotFoundException } from '@nestjs/common'

import { GamesRepository } from '@src/shared/module/database/repositories/games.repository'

import { GameFilterDto, GameResponseDto } from './dto/games-filters.dto'
import { Game } from '@src/shared/entity/game.entity'
import { CacheProvider } from '@src/shared/module/providers/cache/cache.provider'
import { CACHE_KEYS, CACHE_TTL } from './constants/cache-contants'
import {
  generateCacheKey,
  getQueryFromFilters,
  mapGameToResponseDto,
  normalizeGameFilters
} from './utils'
import { GameProvider } from '@src/shared/module/providers/games-database/game.provider'
import { RawgGameInterface } from '@src/shared/interfaces/rawg-game.interface'

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name)

  constructor(
    private readonly gameDatabaseProvider: GameProvider,
    private readonly gamesRepository: GamesRepository,
    private readonly cacheProvider: CacheProvider
  ) {}

  async searchGames(gameFilterDto: GameFilterDto): Promise<GameResponseDto> {
    const gameFilters = normalizeGameFilters(gameFilterDto)

    const cacheKey = generateCacheKey(CACHE_KEYS.GAME_SEARCH, gameFilters)

    const cacheHit = await this.cacheProvider.get<GameResponseDto>(cacheKey)
    if (cacheHit) {
      this.logger.log(`Game found in Cache Hit: ${JSON.stringify(gameFilters)}`)

      return cacheHit
    }

    const gameFromDb = await this.gamesRepository.findOneBy(
      getQueryFromFilters(gameFilters)
    )

    if (gameFromDb) {
      this.logger.log(
        `Game found in database for filters: ${JSON.stringify(gameFilters)}`
      )
      const result = mapGameToResponseDto(gameFromDb)

      await this.cacheProvider.set<GameResponseDto>(
        cacheKey,
        result,
        CACHE_TTL.GAME_SEARCH
      )

      return result
    }

    this.logger.log(
      `Fetching game from RAWG API: ${JSON.stringify(gameFilters)}`
    )

    const rawgGames =
      await this.gameDatabaseProvider.searchGames<RawgGameInterface>({
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

    const result = mapGameToResponseDto(game)

    await this.cacheProvider.set<GameResponseDto>(
      cacheKey,
      result,
      CACHE_TTL.GAME_SEARCH
    )
    await this.cacheProvider.delete(CACHE_KEYS.GAME_LIST)

    return result
  }

  async findAllGames(
    gameFilterDto?: GameFilterDto
  ): Promise<GameResponseDto[]> {
    const gameFilters = normalizeGameFilters(gameFilterDto)

    const cacheKey = gameFilterDto
      ? generateCacheKey(CACHE_KEYS.GAME_LIST, gameFilters)
      : CACHE_KEYS.GAME_LIST

    const cacheHit = await this.cacheProvider.get<GameResponseDto[]>(cacheKey)
    if (cacheHit) {
      this.logger.log('Returning cached games list')
      return cacheHit
    }

    this.logger.log(
      `Games returning from database for filters: ${JSON.stringify(gameFilters)}`
    )

    const games = await this.gamesRepository.findAll(
      getQueryFromFilters(gameFilters)
    )

    const result = games.map((game) => mapGameToResponseDto(game))

    if (result.length) {
      await this.cacheProvider.set<GameResponseDto[]>(
        cacheKey,
        result,
        CACHE_TTL.GAME_LIST
      )
    }

    return result
  }
}
