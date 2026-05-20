import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchPokemon, searchPokemon, fetchRandomPokemon, comparePokemon } from '@/services/api';

export function usePokemon(nameOrId: string, enabled = true) {
  return useQuery({
    queryKey: ['pokemon', nameOrId.toLowerCase()],
    queryFn: () => fetchPokemon(nameOrId),
    enabled: enabled && nameOrId.length > 0,
    staleTime: 1000 * 60 * 10, // 10 min
    retry: 1,
  });
}

export function useSearchPokemon(query: string, limit = 20, enabled = true) {
  return useQuery({
    queryKey: ['pokemon-search', query, limit],
    queryFn: () => searchPokemon(query, 1, limit),
    enabled: enabled && query.trim().length > 0,
    staleTime: 1000 * 60 * 5, // 5 min
    retry: 1,
  });
}

export function useRandomPokemon() {
  return useQuery({
    queryKey: ['pokemon-random'],
    queryFn: fetchRandomPokemon,
    enabled: false,
  });
}

export function useComparePokemon(names: string[], enabled = true) {
  return useQuery({
    queryKey: ['pokemon-compare', ...names.sort()],
    queryFn: () => comparePokemon(names),
    enabled: enabled && names.length >= 2,
    staleTime: 1000 * 60 * 10,
  });
}
