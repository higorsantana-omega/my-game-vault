import { Controller, Get, Query, UsePipes } from '@nestjs/common'
import isPublic from '@src/shared/module/decorators/isPublic.decorator'
import { GamesService } from './games.service'
import { ZodValidationPipe } from 'nestjs-zod'
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger'
import { GameResponseDto } from './dto/games-filters.dto'

@isPublic()
@Controller({
  path: 'games',
  version: '1'
})
@UsePipes(ZodValidationPipe)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get('/search')
  @ApiOkResponse({
    type: GameResponseDto,
    description: 'Search an game by title'
  })
  searchGames(@Query('title') title: string) {
    return this.gamesService.searchGames({ filters: { title } })
  }

  @Get()
  @ApiOkResponse({
    type: [GameResponseDto],
    description: 'List all games'
  })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'platform', required: false })
  getAll(@Query('title') title: string, @Query('platform') platform: string) {
    return this.gamesService.findAllGames({ filters: { title, platform } })
  }
}
