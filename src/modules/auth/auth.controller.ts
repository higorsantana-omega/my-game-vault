import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { SignupDto } from './dto/signup.dto'
import { AccessTokenDto, AuthenticateDto } from './dto/authenticate.dto'

import isPublic from '@src/shared/module/decorators/isPublic.decorator'
import { ApiOkResponse } from '@nestjs/swagger'

@isPublic()
@Controller({
  path: 'auth',
  version: '1'
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: AccessTokenDto,
    description: 'Access token'
  })
  signin(@Body() authenticateDto: AuthenticateDto) {
    return this.authService.authenticate(authenticateDto)
  }

  @Post('signup')
  @ApiOkResponse({
    type: AccessTokenDto,
    description: 'Access token'
  })
  create(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto)
  }
}
