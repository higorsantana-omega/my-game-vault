export type GameFilters = {
  title?: string
  platformName?: string
}

export abstract class GameProvider {
  abstract searchGames<T>(filters: GameFilters): Promise<T[]>
}
