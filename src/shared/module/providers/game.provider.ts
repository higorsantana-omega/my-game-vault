export type GameFilters = {
  title?: string
  platformName?: string
}

export interface GameProvider {
  searchGames(filters: GameFilters): Promise<unknown[]>
}
