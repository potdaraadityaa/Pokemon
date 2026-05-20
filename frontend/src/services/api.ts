import axios from 'axios';
import type { PokemonDetail, SearchResult, CompareResult, ApiResponse } from '@/types/pokemon';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor — unwrap the `data` field from our envelope
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const msg =
      error.response?.data?.error?.message ??
      error.message ??
      'An unexpected error occurred';
    const code = error.response?.data?.error?.code ?? 'UNKNOWN';
    const status = error.response?.status ?? 0;
    const enriched = new Error(msg) as Error & { code: string; status: number };
    enriched.code = code;
    enriched.status = status;
    return Promise.reject(enriched);
  },
);

// ─── Pokemon API calls ────────────────────────────────────────────────────────

export async function fetchPokemon(nameOrId: string): Promise<PokemonDetail> {
  const { data } = await api.get<ApiResponse<PokemonDetail>>(`/pokemon/${nameOrId}`);
  if (!data.success || !data.data) throw new Error('Invalid response from server');
  return data.data;
}

export async function searchPokemon(
  query: string,
  page = 1,
  limit = 20,
): Promise<SearchResult> {
  const { data } = await api.get<ApiResponse<SearchResult>>('/pokemon/search', {
    params: { q: query, page, limit },
  });
  if (!data.success || !data.data) throw new Error('Invalid response from server');
  return data.data;
}

export async function fetchRandomPokemon(): Promise<PokemonDetail> {
  const { data } = await api.get<ApiResponse<PokemonDetail>>('/pokemon/random');
  if (!data.success || !data.data) throw new Error('Invalid response from server');
  return data.data;
}

export async function comparePokemon(names: string[]): Promise<CompareResult> {
  const { data } = await api.get<ApiResponse<CompareResult>>('/pokemon/compare', {
    params: { names: names.join(',') },
  });
  if (!data.success || !data.data) throw new Error('Invalid response from server');
  return data.data;
}

export async function fetchHealth(): Promise<{ status: string; uptime: number }> {
  const { data } = await api.get('/health');
  return data.data;
}
