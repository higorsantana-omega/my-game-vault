import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

const getUserDto = z.object({
  userId: z.string()
})

export class GetUserDto extends createZodDto(getUserDto) {}
