import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as https from 'node:https';

@Controller()
export class AppController {
  constructor(private readonly httpService: HttpService) {}

  @Get()
  async getProverb(): Promise<string> {
    try {
      const agent = new https.Agent({
        rejectUnauthorized: false,
      });

      const response = await firstValueFrom(
        this.httpService.get('https://api.quotable.io/random?tags=wisdom', {
          httpsAgent: agent,
        }),
      );

      return response.data.content;
    } catch (error) {
      console.error('Error fetching proverb:', error);
      throw new InternalServerErrorException('Failed to fetch a proverb.');
    }
  }
}
