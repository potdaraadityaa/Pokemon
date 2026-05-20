import { useState, useEffect, useCallback } from 'react';
import type { FavoritePokemon, RecentPokemon, SearchHistoryEntry } from '@/types/pokemon';
import { MAX_FAVORITES, MAX_RECENT } from '@/constants/pokemon';

const FAVORITES_KEY = 'pokedex:favorites';
const RECENT_KEY = 'pokedex:recent';
const HISTORY_KEY = 'pokedex:search-history';

function getStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full — ignore
  }
}

// ─── Favorites ────────────────────────────────────────────────────────────────
export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoritePokemon[]>(() =>
    getStorage(FAVORITES_KEY, []),
  );

  const isFavorite = useCallback(
    (id: number) => favorites.some((f) => f.id === id),
    [favorites],
  );

  const addFavorite = useCallback((pokemon: Omit<FavoritePokemon, 'addedAt'>) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === pokemon.id)) return prev;
      const next = [{ ...pokemon, addedAt: new Date().toISOString() }, ...prev].slice(
        0,
        MAX_FAVORITES,
      );
      setStorage(FAVORITES_KEY, next);
      return next;
    });
  }, []);

  const removeFavorite = useCallback((id: number) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => f.id !== id);
      setStorage(FAVORITES_KEY, next);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback(
    (pokemon: Omit<FavoritePokemon, 'addedAt'>) => {
      if (isFavorite(pokemon.id)) {
        removeFavorite(pokemon.id);
      } else {
        addFavorite(pokemon);
      }
    },
    [isFavorite, addFavorite, removeFavorite],
  );

  return { favorites, isFavorite, addFavorite, removeFavorite, toggleFavorite };
}

// ─── Recently Viewed ──────────────────────────────────────────────────────────
export function useRecentPokemon() {
  const [recent, setRecent] = useState<RecentPokemon[]>(() =>
    getStorage(RECENT_KEY, []),
  );

  const addRecent = useCallback((pokemon: Omit<RecentPokemon, 'viewedAt'>) => {
    setRecent((prev) => {
      const filtered = prev.filter((r) => r.id !== pokemon.id);
      const next = [
        { ...pokemon, viewedAt: new Date().toISOString() },
        ...filtered,
      ].slice(0, MAX_RECENT);
      setStorage(RECENT_KEY, next);
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
    localStorage.removeItem(RECENT_KEY);
  }, []);

  return { recent, addRecent, clearRecent };
}

// ─── Search History ───────────────────────────────────────────────────────────
export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryEntry[]>(() =>
    getStorage(HISTORY_KEY, []),
  );

  const addHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.query !== query);
      const next = [
        { query, timestamp: new Date().toISOString() },
        ...filtered,
      ].slice(0, 10);
      setStorage(HISTORY_KEY, next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  return { history, addHistory, clearHistory };
}
