import { Injectable } from '@nestjs/common'

import { type Prisma } from '@prisma/client'

import { PrismaService } from '../prisma.service'

import { User } from 'src/shared/entity/user.entity'

type QueryableFields = Prisma.$UserPayload['scalars']

@Injectable()
export class UsersRepository {
  private readonly model: PrismaService['user']

  constructor(prismaService: PrismaService) {
    this.model = prismaService.user
  }

  async findOneBy(fields: Partial<QueryableFields>): Promise<User | null> {
    const user = await this.model.findFirst({
      where: fields
    })
    if (!user) return null

    return User.createFrom(user)
  }

  async save(entity: User): Promise<User> {
    const user = await this.model.create({
      data: entity.serialize()
    })

    return User.createFrom(user)
  }
}
