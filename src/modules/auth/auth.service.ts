import {
  ConflictException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { compare, hash } from 'bcryptjs'

import { UsersRepository } from '@src/shared/module/database/repositories/users.repository'
import { User, type UserData } from '@src/shared/entity/user.entity'

import { SignupDto } from './dto/signup.dto'
import { AuthenticateDto } from './dto/authenticate.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService
  ) {}

  async authenticate(authenticateDto: AuthenticateDto) {
    const user = await this.usersRepository.findOneBy({
      email: authenticateDto.email
    })
    if (!user) throw new UnauthorizedException('Invalid credentials.')

    const isSamePassword = await compare(
      authenticateDto.password,
      user.getPassword()
    )
    if (!isSamePassword) throw new UnauthorizedException('Invalid credentials.')

    const accessToken = await this.generateAccessToken(user.getId())

    return { accessToken }
  }

  async signup(signupDto: SignupDto) {
    const emailTaken = await this.usersRepository.findOneBy({
      email: signupDto.email
    })
    if (emailTaken) throw new ConflictException('This email already in use.')

    const hashedPassword = await hash(signupDto.password, 12)

    const userData: Omit<UserData, 'id'> = {
      name: signupDto.name,
      email: signupDto.email,
      password: hashedPassword
    }

    const user = await this.usersRepository.save(new User(userData as UserData))

    const accessToken = await this.generateAccessToken(user.getId())

    return { accessToken }
  }

  private generateAccessToken(userId: string) {
    return this.jwtService.signAsync({ sub: userId })
  }
}
