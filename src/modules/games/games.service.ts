import { Injectable, Logger, NotFoundException } from '@nestjs/common'

import { GamesRepository } from '@src/shared/module/database/repositories/games.repository'

import { GameResponseDto, RetrieveGamesDto } from './dto/retrive-games.dto'
import { RawgApiProvider } from '@src/shared/module/providers/rawg-api.provider'
import { Game } from '@src/shared/entity/game.entity'

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name)

  constructor(
    private readonly rawgApiProvider: RawgApiProvider,
    private readonly gamesRepository: GamesRepository
  ) {}

  async retrieveGames(retrieveDto: RetrieveGamesDto): Promise<GameResponseDto> {
    const gameFilters = {
      title: retrieveDto?.filters?.title?.trim()?.toLowerCase(),
      platform: retrieveDto?.filters?.platform?.trim()?.toLowerCase()
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
        `No games found with title: ${retrieveDto?.filters?.title || ''}`
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
