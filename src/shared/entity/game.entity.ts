import { faker } from '@faker-js/faker'

export type GameRating = {
  value: number
  count: number
}

export interface GameData {
  id?: string
  title: string
  rawgId: string
  description?: string
  releaseDate?: Date
  platforms: string[]
  imageUrl: string
  rating: GameRating
  createdAt?: Date
  updatedAt?: Date
}

export class Game {
  private readonly id?: string
  private readonly title: string
  private readonly rawgId: string
  private readonly description: string | null
  private readonly releaseDate: Date | null
  private readonly platforms: string[]
  private readonly imageUrl: string
  private readonly rating: GameRating
  private readonly createdAt: Date | null
  private readonly updatedAt: Date | null

  constructor(data: GameData) {
    this.id = data.id
    this.title = data.title
    this.rawgId = data.rawgId
    this.description = data.description || null
    this.releaseDate = data.releaseDate || null
    this.platforms = data.platforms
    this.imageUrl = data.imageUrl
    this.rating = data.rating
    this.createdAt = data.createdAt || null
    this.updatedAt = data.updatedAt || null
  }

  static createFrom(data: GameData): Game {
    return new Game(data)
  }

  getId(): string {
    return this.id as string
  }

  getTitle(): string {
    return this.title
  }

  getRawgId(): string {
    return this.rawgId
  }

  getDescription(): string | null {
    return this.description
  }

  getReleaseDate(): Date | null {
    return this.releaseDate
  }

  getPlatforms(): string[] {
    return this.platforms
  }

  getImageUrl(): string {
    return this.imageUrl
  }

  getRating(): { value: number; count: number } {
    return this.rating
  }

  getCreatedAt(): Date | null {
    return this.createdAt
  }

  getUpdatedAt(): Date | null {
    return this.updatedAt
  }

  serialize() {
    return {
      id: this.id,
      title: this.title,
      rawgId: this.rawgId,
      description: this.description,
      releaseDate: this.releaseDate,
      platforms: this.platforms,
      imageUrl: this.imageUrl,
      rating: this.rating,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }

  static dummy(data?: Partial<GameData>): Game {
    return this.createFrom({
      id: faker.string.uuid(),
      title: faker.commerce.productName(),
      rawgId: faker.string.uuid(),
      description: faker.lorem.sentence(),
      releaseDate: faker.date.past(),
      platforms: [faker.word.noun(), faker.word.noun()],
      imageUrl: faker.image.url(),
      rating: {
        value: faker.number.float({ min: 1, max: 5 }),
        count: faker.number.int({ min: 1, max: 10000 })
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    })
  }
}
