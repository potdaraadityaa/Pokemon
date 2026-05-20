// ─── API Response Types ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
  meta?: {
    requestId: string;
    timestamp: string;
    duration?: number;
    cached?: boolean;
    cacheSource?: 'redis' | 'memory' | 'none';
  };
}

// ─── Pokemon Domain Types ─────────────────────────────────────────────────────

export interface PokemonStat {
  name: string;
  baseStat: number;
  effort: number;
}

export interface PokemonAbility {
  name: string;
  isHidden: boolean;
  slot: number;
}

export interface PokemonSprites {
  frontDefault: string | null;
  backDefault: string | null;
  frontShiny: string | null;
  officialArtwork: string | null;
  dreamWorld: string | null;
  home: string | null;
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  baseExperience: number | null;
  types: string[];
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  sprites: PokemonSprites;
  moves: string[];
  species: string;
  isLegendary?: boolean;
  isMythical?: boolean;
  isBaby?: boolean;
  generation?: string;
  color?: string;
  shape?: string | null;
  habitat?: string | null;
  description?: string;
  genus?: string;
  captureRate?: number;
  baseHappiness?: number | null;
  eggGroups?: string[];
  evolvesFrom?: string | null;
}

export interface PokemonListItem {
  id: number;
  name: string;
  url: string;
  sprite: string | null;
}

export interface SearchResult {
  total: number;
  results: PokemonListItem[];
  query: string;
  page: number;
  limit: number;
}

export interface StatComparison {
  stat: string;
  values: Record<string, number>;
  winner: string | null;
}

export interface CompareResult {
  pokemon: PokemonDetail[];
  comparison: StatComparison[];
}

// ─── App State Types ──────────────────────────────────────────────────────────

export interface FavoritePokemon {
  id: number;
  name: string;
  sprite: string | null;
  types: string[];
  addedAt: string;
}

export interface RecentPokemon {
  id: number;
  name: string;
  sprite: string | null;
  types: string[];
  viewedAt: string;
}

export interface SearchHistoryEntry {
  query: string;
  timestamp: string;
}
