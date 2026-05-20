import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../config';
import { logger } from './logger';
import { AppError } from '../types/api.types';

class PokeApiClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.pokeApi.baseUrl,
      timeout: config.pokeApi.timeout,
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
      },
    });

    // Request interceptor — log outgoing calls
    this.client.interceptors.request.use((req) => {
      logger.debug(`[PokeAPI] → ${req.method?.toUpperCase()} ${req.url}`);
      return req;
    });

    // Response interceptor — log responses & normalise errors
    this.client.interceptors.response.use(
      (res) => {
        logger.debug(`[PokeAPI] ← ${res.status} ${res.config.url}`);
        return res;
      },
      (error: AxiosError) => {
        const status = error.response?.status;
        const url = error.config?.url ?? 'unknown';

        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          logger.warn(`[PokeAPI] Timeout: ${url}`);
          throw AppError.timeout(`PokeAPI request timed out after ${config.pokeApi.timeout}ms`);
        }

        if (status === 404) {
          throw AppError.notFound(`Pokemon not found`);
        }

        logger.error(`[PokeAPI] Error ${status}: ${url}`, { message: error.message });
        throw AppError.upstreamError(`PokeAPI returned error ${status ?? 'unknown'}`);
      },
    );
  }

  async get<T>(path: string): Promise<T> {
    const res = await this.client.get<T>(path);
    return res.data;
  }
}

// Singleton
export const pokeApiClient = new PokeApiClient();
