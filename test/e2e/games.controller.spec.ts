/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { GamesRepository } from '@src/shared/module/database/repositories/games.repository'
import { PrismaService } from '@src/shared/module/database/prisma.service'
import { CacheProvider } from '@src/shared/module/providers/cache/cache.provider'
import { AppModule } from '@src/app.module'
import { GamesModule } from '@src/modules/games/games.module'
import { Game } from '@src/shared/entity/game.entity'
import { PaginatedGameResponse } from '@src/modules/games/dto/games-filters.dto'

describe('GamesController (e2e)', () => {
  let app: INestApplication
  let gamesRepository: GamesRepository
  let prismaService: PrismaService
  let cacheProvider: CacheProvider

  const games = Array(25)
    .fill(null)
    .map((_, index) => {
      const platforms =
        index % 3 === 0
          ? ['ps5', 'xbox']
          : index % 3 === 1
            ? ['pc', 'nintendo switch']
            : ['ps5', 'pc']

      const title =
        index % 5 === 0 ? `popular game ${index}` : `game title ${index}`

      return Game.dummy({
        id: `game-${index}`,
        title,
        platforms
      })
    })

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, GamesModule]
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    gamesRepository = moduleFixture.get<GamesRepository>(GamesRepository)
    prismaService = moduleFixture.get<PrismaService>(PrismaService)
    cacheProvider = moduleFixture.get<CacheProvider>(CacheProvider)
  })

  beforeEach(async () => {
    await prismaService.game.deleteMany({})
    await cacheProvider.delete('games:list')

    for (const game of games) {
      await prismaService.game.create({
        data: {
          title: game.getTitle(),
          rawgId: game.getRawgId(),
          description: game.getDescription(),
          releaseDate: game.getReleaseDate() || new Date(),
          platforms: game.getPlatforms(),
          imageUrl: game.getImageUrl(),
          rating: game.getRating(),
          createdAt: game.getCreatedAt() || new Date(),
          updatedAt: game.getUpdatedAt() || new Date()
        }
      })
    }
  })

  afterAll(async () => {
    await prismaService.game.deleteMany({})
    await app.close()
  })

  describe('GET /games', () => {
    it('should return the first page of games with default pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/games')
        .expect(200)

      const body = response.body as unknown as PaginatedGameResponse

      expect(body).toBeDefined()
      expect(body.data).toBeInstanceOf(Array)
      expect(body.data.length).toBeLessThanOrEqual(10)
      expect(body.meta).toBeDefined()
      expect(body.meta.page).toBe(1)
      expect(body.meta.limit).toBe(10)
      expect(body.meta.total).toBe(24)
      expect(body.meta.totalPages).toBe(3)
    })

    it('should return the specified page of games with custom limit', async () => {
      const response = await request(app.getHttpServer())
        .get('/games?page=2&limit=5')
        .expect(200)

      const body = response.body as unknown as PaginatedGameResponse

      expect(body.data.length).toBeLessThanOrEqual(5)
      expect(body.meta.page).toBe(2)
      expect(body.meta.limit).toBe(5)
      expect(body.meta.totalPages).toBe(5)
    })

    it('should handle requests with invalid pagination parameters gracefully', async () => {
      const response = await request(app.getHttpServer())
        .get('/games?page=-1&limit=1000')
        .expect(200)

      const body = response.body as unknown as PaginatedGameResponse

      expect(body.meta.page).toBe(1)
      expect(body.meta.limit).toBeLessThanOrEqual(100)
    })

    it('should filter games by title', async () => {
      const response = await request(app.getHttpServer())
        .get('/games?title=popular')
        .expect(200)

      const body = response.body as unknown as PaginatedGameResponse

      expect(body.data.length).toBe(5)
      expect(body.meta.total).toBe(5)

      body.data.forEach((game) => {
        expect(game.title).toContain('popular')
      })
    })

    it('should filter games by platform', async () => {
      const response = await request(app.getHttpServer())
        .get('/games?platform=nintendo switch')
        .expect(200)

      const body = response.body as unknown as PaginatedGameResponse

      expect(body.meta.total).toBeGreaterThanOrEqual(8)

      body.data.forEach((game) => {
        expect(game.platforms).toContain('nintendo switch')
      })
    })

    it('should filter games by title and platform', async () => {
      const response = await request(app.getHttpServer())
        .get('/games?title=game&platform=ps5')
        .expect(200)

      const body = response.body as unknown as PaginatedGameResponse

      body.data.forEach((game) => {
        expect(game.title).toContain('game')
        expect(game.platforms).toContain('ps5')
      })
    })

    it('should handle case-insensitive filtering', async () => {
      const response = await request(app.getHttpServer())
        .get('/games?title=POPULAR&platform=PS5')
        .expect(200)

      const body = response.body as unknown as PaginatedGameResponse

      expect(body.data.length).toBeGreaterThan(0)
      body.data.forEach((game) => {
        expect(game.title.toLowerCase()).toContain('popular')
        expect(game.platforms).toContain('ps5')
      })
    })

    it('should return empty data array when no games match filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/games?title=nonexistentgame')
        .expect(200)

      const body = response.body as unknown as PaginatedGameResponse

      expect(body.data).toEqual([])
      expect(body.meta.total).toBe(0)
      expect(body.meta.totalPages).toBe(0)
    })

    it('should use cached results on subsequent requests', async () => {
      const firstResponse = await request(app.getHttpServer())
        .get('/games?limit=5')
        .expect(200)

      const findAllSpy = jest.spyOn(gamesRepository, 'findAllPaginated')

      const secondResponse = await request(app.getHttpServer())
        .get('/games?limit=5')
        .expect(200)

      expect(findAllSpy).not.toHaveBeenCalled()

      const body = secondResponse.body as unknown as PaginatedGameResponse

      expect(body).toEqual(firstResponse.body)

      findAllSpy.mockRestore()
    })

    it('should return correct last page with remaining items', async () => {
      const response = await request(app.getHttpServer())
        .get('/games?page=3&limit=10')
        .expect(200)

      const body = response.body as unknown as PaginatedGameResponse

      expect(body.data.length).toBe(5)
      expect(body.meta.page).toBe(3)
      expect(body.meta.totalPages).toBe(3)
    })

    it('should handle an empty page beyond the available data gracefully', async () => {
      const response = await request(app.getHttpServer())
        .get('/games?page=10&limit=10')
        .expect(200)

      const body = response.body as unknown as PaginatedGameResponse

      expect(body.data).toEqual([])
      expect(body.meta.page).toBe(10)
      expect(body.meta.total).toBe(25)
      expect(body.meta.totalPages).toBe(3)
    })
  })
})
