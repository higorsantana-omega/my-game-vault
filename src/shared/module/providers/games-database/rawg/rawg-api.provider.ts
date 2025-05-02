/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { catchError, map, firstValueFrom, throwError } from 'rxjs'
import { env } from '@src/shared/config/env'
import { GameFilters, GameProvider } from '../game.provider'
import { RawgGameInterface } from '@src/shared/interfaces/rawg-game.interface'
import { AxiosResponse } from 'axios'

@Injectable()
export class RawgApiProvider implements GameProvider {
  private readonly logger = new Logger(RawgApiProvider.name)

  private readonly apiBaseUrl: string
  private readonly apiKey: string

  constructor(private readonly httpService: HttpService) {
    this.apiBaseUrl = 'https://api.rawg.io/api'
    this.apiKey = env.RAWG_API_KEY
  }

  async searchGames<RawgGameInterface>({
    title,
    platformName
  }: GameFilters): Promise<RawgGameInterface[]> {
    const url = `${this.apiBaseUrl}/games`

    const searchParams: Record<string, any> = {
      key: this.apiKey,
      page_size: 10
    }

    if (title) {
      searchParams.search = title
    }

    if (platformName) {
      try {
        const platformId = await this.getPlatformIdByName(platformName)
        if (platformId) {
          searchParams.platforms = platformId
        }
      } catch (_) {
        this.logger.warn(`Could not find platform ID for name: ${platformName}`)
      }
    }

    try {
      const response = await firstValueFrom(
        this.httpService
          .get<{ results: RawgGameInterface[] }>(url, {
            params: searchParams
          })
          .pipe(
            map(
              (res: AxiosResponse<{ results: RawgGameInterface[] }>) =>
                res.data.results
            ),
            catchError((error) => {
              let message = 'Unknown error'
              if (error instanceof Error) message = error.message

              return throwError(
                () =>
                  new HttpException(
                    `Failed to fetch games from RAWG API: ${message}`,
                    HttpStatus.BAD_GATEWAY
                  )
              )
            })
          )
      )

      return response
    } catch (error) {
      let message = 'Unknown error'
      if (error instanceof Error) message = error.message

      throw new HttpException(
        `Error searching games: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  private async getPlatformIdByName(
    platformName: string
  ): Promise<string | null> {
    const url = `${this.apiBaseUrl}/platforms`

    try {
      const response = await firstValueFrom(
        this.httpService
          .get(url, {
            params: {
              key: this.apiKey,
              search: platformName
            }
          })
          .pipe(
            map((res) => res.data.results),
            catchError((error) => {
              throw new HttpException(
                `Failed to fetch platforms from RAWG API: ${error.message}`,
                HttpStatus.BAD_GATEWAY
              )
            })
          )
      )

      if (response && response.length > 0) {
        const platform = response.find(
          (p) =>
            p.name.toLowerCase().includes(platformName.toLowerCase()) ||
            platformName.toLowerCase().includes(p.name.toLowerCase())
        )

        if (platform) {
          return platform.id.toString()
        }
      }

      return null
    } catch (error) {
      this.logger.error(`Error fetching platform ID: ${error.message}`)
      return null
    }
  }
}
