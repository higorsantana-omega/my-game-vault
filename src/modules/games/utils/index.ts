import { Game } from '@src/shared/entity/game.entity'

import { GameFilterDto, GameResponseDto } from '../dto/games-filters.dto'

export const normalizeGameFilters = (gameFilterDto?: GameFilterDto) => {
  return {
    title: gameFilterDto?.filters?.title?.trim()?.toLowerCase() || '',
    platform: gameFilterDto?.filters?.platform?.trim()?.toLowerCase() || '',
    pagination: {
      page: Math.max(1, gameFilterDto?.pagination?.page || 1),
      limit: Math.min(100, Math.max(1, gameFilterDto?.pagination?.limit || 10))
    }
  }
}

export const generateCacheKey = (
  prefix: string,
  params: Record<string, any>
) => {
  return `${prefix}:${JSON.stringify(params)}`
}

export const getQueryFromFilters = (filters: {
  title: string
  platform: string
}) => {
  return {
    title: filters.title ? { contains: filters.title } : undefined,
    platforms: filters.platform ? { has: filters.platform } : undefined
  }
}

export const mapGameToResponseDto = (game: Game): GameResponseDto => {
  const gameData = game.serialize()
  return {
    id: gameData.id as string,
    title: gameData.title,
    description: gameData.description ?? '',
    releaseDate: gameData.releaseDate?.toISOString().split('T')[0] as string,
    platforms: gameData.platforms,
    imageUrl: gameData.imageUrl,
    rating: gameData.rating
  }
}
