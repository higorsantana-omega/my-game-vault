import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

const showUserSchema = z.object({
  name: z.string(),
  email: z.string()
})

export class ShowUserDto extends createZodDto(showUserSchema) {}
