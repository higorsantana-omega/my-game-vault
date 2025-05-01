import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator
} from '@nestjs/common'

const ActiveUserId = createParamDecorator<undefined>(
  (data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{ userId: string }>()
    const userId = request?.userId
    if (!userId) throw new UnauthorizedException()

    return userId
  }
)

export { ActiveUserId }
