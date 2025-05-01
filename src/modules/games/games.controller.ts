import { Controller, Get, Query } from '@nestjs/common'
import isPublic from '@src/shared/module/decorators/isPublic.decorator'
import { GamesService } from './games.service'

@isPublic()
@Controller({
  path: 'games',
  version: '1'
})
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get('/search')
  searchGames(@Query('title') title: string) {
    return this.gamesService.retrieveGames({ filters: { title } })
  }
}
