import { Injectable, Logger, NotFoundException } from '@nestjs/common'

import { GameResponseDto, RetrieveGamesDto } from './dto/retrive-games.dto'
import { RawgApiProvider } from '@src/shared/module/providers/rawg-api.provider'
import { Game } from '@src/shared/entity/game.entity'

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name)

  constructor(private readonly rawgApiProvider: RawgApiProvider) {}

  async retrieveGames(retrieveDto: RetrieveGamesDto): Promise<GameResponseDto> {
    this.logger.log(
      `Fetching game from RAWG API: ${retrieveDto?.filters?.title || ''}`
    )

    const rawgGames = await this.rawgApiProvider.searchGamesByTitle(
      retrieveDto.filters?.title as string
    )

    if (!rawgGames || rawgGames.length === 0) {
      throw new NotFoundException(
        `No games found with title: ${retrieveDto?.filters?.title || ''}`
      )
    }

    const rawgGame = rawgGames[0]

    const game = new Game({
      title: rawgGame.name,
      rawgId: rawgGame.id,
      description: '',
      releaseDate: new Date(rawgGame.released),
      platforms: rawgGame.platforms?.map((p) => p.platform.name) || [],
      imageUrl: rawgGame.background_image,
      rating: {
        value: rawgGame.rating,
        count: rawgGame.ratings_count
      }
    })

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
