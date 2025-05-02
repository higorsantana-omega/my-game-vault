/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'

import { mock, MockProxy } from 'jest-mock-extended'

import { UsersRepository } from '@src/shared/module/database/repositories/users.repository'
import { User } from '@src/shared/entity/user.entity'
import { UsersService } from '@src/modules/users/users.service'
import { GetUserDto } from '@src/modules/users/dto/user.dto'
import { ShowUserDto } from '@src/modules/users/dto/show-user.dto'

describe('UsersService', () => {
  let usersService: UsersService
  let usersRepository: MockProxy<UsersRepository>

  beforeEach(async () => {
    usersRepository = mock()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: usersRepository }
      ]
    }).compile()

    usersService = module.get<UsersService>(UsersService)
  })

  afterEach(() => jest.resetAllMocks())

  describe('getUserById', () => {
    const fakeUser = User.dummy()
    const dto: GetUserDto = {
      userId: fakeUser.getId()
    }

    it('should throw NotFoundException if user does not exist', async () => {
      usersRepository.findOneBy.mockResolvedValueOnce(null)

      await expect(usersService.getUserById(dto)).rejects.toThrow(
        new NotFoundException('User not found.')
      )

      expect(usersRepository.findOneBy).toHaveBeenCalledWith({
        id: dto.userId
      })
      expect(usersRepository.findOneBy).toHaveBeenCalledTimes(1)
    })

    it('should return user data when user exists', async () => {
      usersRepository.findOneBy.mockResolvedValueOnce(fakeUser)

      const expectedResult: ShowUserDto = {
        name: fakeUser.getName(),
        email: fakeUser.getEmail()
      }

      const result = await usersService.getUserById(dto)

      expect(usersRepository.findOneBy).toHaveBeenCalledWith({
        id: dto.userId
      })
      expect(usersRepository.findOneBy).toHaveBeenCalledTimes(1)
      expect(result).toEqual(expectedResult)
    })
  })
})
