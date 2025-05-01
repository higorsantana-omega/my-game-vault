import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common'
import { UsersService } from './users.service'
import { ActiveUserId } from '@src/shared/module/decorators/activeUserId.decorator'

@Controller({
  path: 'users',
  version: '1'
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/me')
  @HttpCode(HttpStatus.OK)
  me(@ActiveUserId() userId: string) {
    return this.usersService.getUserById({ userId })
  }
}
