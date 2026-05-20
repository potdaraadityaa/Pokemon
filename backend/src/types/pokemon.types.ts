// ─── Raw PokeAPI shapes (subset we care about) ───────────────────────────────

export interface PokeApiNamedResource {
  name: string;
  url: string;
}

export interface PokeApiStat {
  base_stat: number;
  effort: number;
  stat: PokeApiNamedResource;
}

export interface PokeApiType {
  slot: number;
  type: PokeApiNamedResource;
}

export interface PokeApiAbility {
  ability: PokeApiNamedResource;
  is_hidden: boolean;
  slot: number;
}

export interface PokeApiSprites {
  front_default: string | null;
  back_default: string | null;
  front_shiny: string | null;
  back_shiny: string | null;
  other?: {
    'official-artwork'?: {
      front_default: string | null;
      front_shiny: string | null;
    };
    dream_world?: {
      front_default: string | null;
    };
    home?: {
      front_default: string | null;
      front_shiny: string | null;
    };
  };
}

export interface PokeApiMove {
  move: PokeApiNamedResource;
}

export interface PokeApiGameIndex {
  game_index: number;
  version: PokeApiNamedResource;
}

export interface PokeApiHeldItem {
  item: PokeApiNamedResource;
}

export interface PokeApiRawPokemon {
  id: number;
  name: string;
  base_experience: number | null;
  height: number;
  is_default: boolean;
  order: number;
  weight: number;
  abilities: PokeApiAbility[];
  forms: PokeApiNamedResource[];
  game_indices: PokeApiGameIndex[];
  held_items: PokeApiHeldItem[];
  location_area_encounters: string;
  moves: PokeApiMove[];
  species: PokeApiNamedResource;
  sprites: PokeApiSprites;
  stats: PokeApiStat[];
  types: PokeApiType[];
}

export interface PokeApiSpecies {
  id: number;
  name: string;
  is_legendary: boolean;
  is_mythical: boolean;
  is_baby: boolean;
  generation: PokeApiNamedResource;
  color: PokeApiNamedResource;
  shape: PokeApiNamedResource | null;
  habitat: PokeApiNamedResource | null;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number | null;
  hatch_counter: number | null;
  flavor_text_entries: FlavorTextEntry[];
  genera: Genus[];
  egg_groups: PokeApiNamedResource[];
  evolves_from_species: PokeApiNamedResource | null;
  evolution_chain: { url: string };
}

export interface FlavorTextEntry {
  flavor_text: string;
  language: PokeApiNamedResource;
  version: PokeApiNamedResource;
}

export interface Genus {
  genus: string;
  language: PokeApiNamedResource;
}

export interface PokeApiListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokeApiNamedResource[];
}

// ─── Internal Domain Models ───────────────────────────────────────────────────

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
  height: number; // decimetres
  weight: number; // hectograms
  baseExperience: number | null;
  types: string[];
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  sprites: PokemonSprites;
  moves: string[];
  species: string;
  // From species endpoint
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

export interface CompareResult {
  pokemon: PokemonDetail[];
  comparison: StatComparison[];
}

export interface StatComparison {
  stat: string;
  values: Record<string, number>;
  winner: string | null;
}
