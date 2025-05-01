import { Injectable, NotFoundException } from '@nestjs/common'

import { ShowUserDto } from './dto/show-user.dto'
import { GetUserDto } from './dto/user.dto'

import { UsersRepository } from '@src/shared/module/database/repositories/users.repository'

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getUserById(getUserDto: GetUserDto): Promise<ShowUserDto> {
    const user = await this.usersRepository.findOneBy({
      id: getUserDto.userId
    })
    if (!user) throw new NotFoundException('User not found.')

    return {
      name: user.getName(),
      email: user.getEmail()
    }
  }
}
