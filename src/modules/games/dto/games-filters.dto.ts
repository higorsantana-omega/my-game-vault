import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

const gameFilterDto = z.object({
  filters: z
    .object({
      title: z.string().optional().describe('The title of game'),
      platform: z.string().optional().describe('The platform of game')
    })
    .optional(),
  pagination: z
    .object({
      page: z.number().optional(),
      limit: z.number().optional()
    })
    .optional()
})

export class GameFilterDto extends createZodDto(gameFilterDto) {}

const ratingGameDto = z.object({
  value: z.number().describe('5'),
  count: z.number().describe('10000')
})

export const gameResponseDto = z.object({
  id: z.string().describe('f47ac10b-58cc-4372-a567-0e02b2c3d479'),
  title: z.string().describe('God Of War'),
  description: z.string().optional().describe('Um jogo de ação e aventura...'),
  releaseDate: z.string().describe('2018-04-01'),
  platforms: z.array(z.string()).describe('PlayStation 4'),
  imageUrl: z
    .string()
    .describe(
      'https://media.rawg.io/media/games/4be/4be6a6ad0364751a96229c56bf69be59.jpg'
    ),
  rating: ratingGameDto
})

export class GameResponseDto extends createZodDto(gameResponseDto) {}

export const paginatedResponseDto = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    meta: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number()
    })
  })

export type PaginatedGameResponse = z.infer<
  ReturnType<typeof paginatedResponseDto<typeof gameResponseDto>>
>
