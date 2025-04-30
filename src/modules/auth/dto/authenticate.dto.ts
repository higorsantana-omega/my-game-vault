import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

const authenticateSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Invalid email format' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters long' })
})

export class AuthenticateDto extends createZodDto(authenticateSchema) {}
