export interface RawgGameInterface {
  id: number
  slug: string
  name: string
  platforms: {
    platform: {
      id: number
      name: string
      slug: string
    }
    released_at?: string
    requirements?: {
      minimum?: string
      recommended?: string
    }
  }[]
  released: string
  rating: number
  ratings_count: number
  background_image: string
}
