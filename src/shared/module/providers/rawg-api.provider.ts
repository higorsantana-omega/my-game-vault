/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { catchError, map, firstValueFrom, throwError } from 'rxjs'
import { env } from '@src/shared/config/env'
import { GameProvider } from './game.provider'
import { RawgGameInterface } from '@src/shared/interfaces/rawg-game.interface'
import { AxiosResponse } from 'axios'

@Injectable()
export class RawgApiProvider implements GameProvider {
  private readonly apiBaseUrl: string
  private readonly apiKey: string

  constructor(private readonly httpService: HttpService) {
    this.apiBaseUrl = 'https://api.rawg.io/api'
    this.apiKey = env.RAWG_API_KEY
  }

  async searchGamesByTitle(title: string): Promise<RawgGameInterface[]> {
    const url = `${this.apiBaseUrl}/games`

    try {
      const response = await firstValueFrom(
        this.httpService
          .get<{ results: RawgGameInterface[] }>(url, {
            params: {
              key: this.apiKey,
              search: title,
              page_size: 10
            }
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
}
