/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { UnauthorizedException, ConflictException } from '@nestjs/common'
import { mock, MockProxy } from 'jest-mock-extended'

import { UsersRepository } from '@src/shared/module/database/repositories/users.repository'
import { User } from '@src/shared/entity/user.entity'
import { AuthService } from '@src/modules/auth/auth.service'
import { AuthenticateDto } from '@src/modules/auth/dto/authenticate.dto'
import { SignupDto } from '@src/modules/auth/dto/signup.dto'

describe('AuthService', () => {
  let authService: AuthService
  let usersRepository: MockProxy<UsersRepository>
  let jwtService: MockProxy<JwtService>

  beforeEach(async () => {
    usersRepository = mock()
    jwtService = mock()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersRepository, useValue: usersRepository },
        { provide: JwtService, useValue: jwtService }
      ]
    }).compile()

    authService = module.get<AuthService>(AuthService)
  })

  afterEach(() => jest.resetAllMocks())

  describe('authenticate', () => {
    const fakeUser = User.dummy()
    const dto: AuthenticateDto = {
      email: fakeUser.getEmail(),
      password: fakeUser.getPassword()
    }

    it('should throw UnauthorizedException if email not exists', async () => {
      usersRepository.findOneBy.mockResolvedValueOnce(null)

      await expect(
        authService.authenticate({
          ...dto,
          email: 'not-exists@mail.com'
        })
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials.'))

      expect(usersRepository.findOneBy).toHaveBeenCalledWith({
        email: 'not-exists@mail.com'
      })
      expect(usersRepository.findOneBy).toHaveBeenCalledTimes(1)
    })

    it('should throw UnauthorizedException if password is not the same', async () => {
      usersRepository.findOneBy.mockResolvedValueOnce(fakeUser)

      await expect(
        authService.authenticate({
          ...dto,
          password: 'NotSam2123@!'
        })
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials.'))

      expect(usersRepository.findOneBy).toHaveBeenCalledWith({
        email: fakeUser.getEmail()
      })
      expect(usersRepository.findOneBy).toHaveBeenCalledTimes(1)
    })
  })

  describe('signup', () => {
    const fakeUser = User.dummy()
    const dto: SignupDto = {
      name: fakeUser.getName(),
      email: fakeUser.getEmail(),
      password: fakeUser.getPassword()
    }

    it('should throw ConflictException if email already in use', async () => {
      usersRepository.findOneBy.mockResolvedValueOnce(fakeUser)

      await expect(authService.signup(dto)).rejects.toThrow(
        new ConflictException('This email already in use.')
      )

      expect(usersRepository.findOneBy).toHaveBeenCalledWith({
        email: fakeUser.getEmail()
      })
      expect(usersRepository.findOneBy).toHaveBeenCalledTimes(1)
    })

    it('should create new user and return accessToken', async () => {
      usersRepository.findOneBy.mockResolvedValueOnce(null)
      usersRepository.save.mockResolvedValueOnce(fakeUser)

      const token = 'signup-token'
      jwtService.signAsync.mockResolvedValue(token)

      const result = await authService.signup(dto)

      expect(usersRepository.findOneBy).toHaveBeenCalledWith({
        email: dto.email
      })
      expect(usersRepository.save).toHaveBeenCalledTimes(1)
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: fakeUser.getId()
      })
      expect(result).toEqual({ accessToken: token })
    })
  })
})
