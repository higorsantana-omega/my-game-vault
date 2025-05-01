export interface GameProvider {
  searchGamesByTitle(title: string): Promise<unknown[]>
}
