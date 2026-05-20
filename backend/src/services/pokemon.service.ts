import {
  PokeApiRawPokemon,
  PokeApiSpecies,
  PokeApiListResponse,
  PokemonDetail,
  PokemonListItem,
  SearchResult,
  CompareResult,
  StatComparison,
  FlavorTextEntry,
} from '../types/pokemon.types';
import { pokeApiClient } from '../utils/pokeApiClient';
import { getCacheManager, CacheKeys } from '../cache/cacheManager';
import { logger } from '../utils/logger';
import { idFromUrl, normalisePokemonName, spriteUrlById, clamp, retry } from '../utils/helpers';
import { AppError } from '../types/api.types';

// ─── Transformer helpers ──────────────────────────────────────────────────────

function extractDescription(entries: FlavorTextEntry[]): string {
  const english = entries
    .filter((e) => e.language.name === 'en')
    .map((e) => e.flavor_text.replace(/\f|\n/g, ' ').replace(/\s+/g, ' ').trim());
  return english[0] ?? '';
}

function extractGenus(genera: { genus: string; language: { name: string } }[]): string {
  return genera.find((g) => g.language.name === 'en')?.genus ?? '';
}

function mapRawToDetail(raw: PokeApiRawPokemon, species?: PokeApiSpecies): PokemonDetail {
  return {
    id: raw.id,
    name: raw.name,
    height: raw.height,
    weight: raw.weight,
    baseExperience: raw.base_experience,
    types: raw.types.map((t) => t.type.name),
    abilities: raw.abilities.map((a) => ({
      name: a.ability.name,
      isHidden: a.is_hidden,
      slot: a.slot,
    })),
    stats: raw.stats.map((s) => ({
      name: s.stat.name,
      baseStat: s.base_stat,
      effort: s.effort,
    })),
    sprites: {
      frontDefault: raw.sprites.front_default,
      backDefault: raw.sprites.back_default,
      frontShiny: raw.sprites.front_shiny,
      officialArtwork:
        raw.sprites.other?.['official-artwork']?.front_default ??
        spriteUrlById(raw.id),
      dreamWorld: raw.sprites.other?.dream_world?.front_default ?? null,
      home: raw.sprites.other?.home?.front_default ?? null,
    },
    moves: raw.moves.slice(0, 20).map((m) => m.move.name),
    species: raw.species.name,
    // Species fields — populated if available
    isLegendary: species?.is_legendary,
    isMythical: species?.is_mythical,
    isBaby: species?.is_baby,
    generation: species?.generation.name,
    color: species?.color.name,
    shape: species?.shape?.name ?? null,
    habitat: species?.habitat?.name ?? null,
    description: species ? extractDescription(species.flavor_text_entries) : undefined,
    genus: species ? extractGenus(species.genera) : undefined,
    captureRate: species?.capture_rate,
    baseHappiness: species?.base_happiness ?? null,
    eggGroups: species?.egg_groups.map((eg) => eg.name),
    evolvesFrom: species?.evolves_from_species?.name ?? null,
  };
}

// ─── PokemonService ───────────────────────────────────────────────────────────

class PokemonService {
  private inFlightRequests = new Map<string, Promise<PokemonDetail>>();

  /** Fetch a single Pokemon by name or ID */
  async getPokemonByName(nameOrId: string): Promise<PokemonDetail> {
    const key = normalisePokemonName(String(nameOrId));
    
    if (this.inFlightRequests.has(key)) {
      return this.inFlightRequests.get(key)!;
    }

    const promise = (async () => {
      const cache = getCacheManager();
      const cacheKey = CacheKeys.pokemon(key);

      // Cache hit
      const cached = await cache.get<PokemonDetail>(cacheKey);
      if (cached) {
        logger.debug(`[PokemonService] Cache hit (${cached.source}): ${key}`);
        return cached.value;
      }

      // Fetch base Pokemon data
      let raw: PokeApiRawPokemon;
      try {
        raw = await retry(() => pokeApiClient.get<PokeApiRawPokemon>(`/pokemon/${key}`));
      } catch (err) {
        if (err instanceof AppError && err.code === 'NOT_FOUND') {
          throw AppError.notFound(`Pokemon "${nameOrId}" not found`);
        }
        throw err;
      }

      // Fetch species in parallel (non-fatal)
      let species: PokeApiSpecies | undefined;
      try {
        const speciesCacheKey = CacheKeys.species(raw.species.name);
        const cachedSpecies = await cache.get<PokeApiSpecies>(speciesCacheKey);
        if (cachedSpecies) {
          species = cachedSpecies.value;
        } else {
          species = await retry(() => pokeApiClient.get<PokeApiSpecies>(`/pokemon-species/${raw.species.name}`));
          await cache.set(speciesCacheKey, species);
        }
      } catch (err) {
        logger.warn(`[PokemonService] Species fetch failed for ${raw.species.name}`, {
          error: (err as Error).message,
        });
      }

      const detail = mapRawToDetail(raw, species);
      await cache.set(cacheKey, detail);
      logger.debug(`[PokemonService] Cached: ${key}`);
      return detail;
    })();

    this.inFlightRequests.set(key, promise);
    try {
      return await promise;
    } finally {
      this.inFlightRequests.delete(key);
    }
  }

  /** Fetch the full list of Pokemon (names + ids) — used for search */
  private async fetchPokemonPool(): Promise<PokemonListItem[]> {
    const cache = getCacheManager();
    const cacheKey = CacheKeys.random();

    const cached = await cache.get<PokemonListItem[]>(cacheKey);
    if (cached) return cached.value;

    // Fetch up to 1302 (all Pokemon as of Gen IX)
    const listRes = await retry(() => pokeApiClient.get<PokeApiListResponse>('/pokemon?limit=1302&offset=0'));
    const items: PokemonListItem[] = listRes.results.map((r) => {
      const id = idFromUrl(r.url);
      return {
        id,
        name: r.name,
        url: r.url,
        sprite: spriteUrlById(id),
      };
    });

    // Cache for 24 hours — this list changes very rarely
    await cache.set(cacheKey, items, 86400);
    return items;
  }

  /** Search Pokemon by partial name */
  async searchPokemon(
    query: string,
    page = 1,
    limit = 20,
  ): Promise<SearchResult> {
    if (query.length < 1) throw AppError.badRequest('Search query must be at least 1 character');

    const q = normalisePokemonName(query);
    const cache = getCacheManager();
    const cacheKey = CacheKeys.search(q, page, limit);

    const cached = await cache.get<SearchResult>(cacheKey);
    if (cached) {
      logger.debug(`[PokemonService] Search cache hit: ${q}`);
      return cached.value;
    }

    const pool = await this.fetchPokemonPool();
    const matched = pool.filter((p) => p.name.includes(q));

    const safePage = clamp(page, 1, Math.ceil(matched.length / limit) || 1);
    const offset = (safePage - 1) * limit;
    const paged = matched.slice(offset, offset + limit);

    const result: SearchResult = {
      total: matched.length,
      results: paged,
      query,
      page: safePage,
      limit,
    };

    await cache.set(cacheKey, result, 300); // 5 min TTL for searches
    return result;
  }

  /** Return a random Pokemon */
  async getRandomPokemon(): Promise<PokemonDetail> {
    const pool = await this.fetchPokemonPool();
    const random = pool[Math.floor(Math.random() * pool.length)];
    if (!random) throw AppError.internal('Failed to pick random Pokemon');
    return this.getPokemonByName(String(random.id));
  }

  /** Compare two or more Pokemon side-by-side */
  async comparePokemon(names: string[]): Promise<CompareResult> {
    if (names.length < 2) throw AppError.badRequest('Compare requires at least 2 Pokemon');
    if (names.length > 6) throw AppError.badRequest('Cannot compare more than 6 Pokemon');

    // Fetch all in parallel
    const pokemon = await Promise.all(
      names.map((n) => this.getPokemonByName(n)),
    );

    // Build stat comparison
    const allStatNames = [...new Set(pokemon.flatMap((p) => p.stats.map((s) => s.name)))];
    const comparison: StatComparison[] = allStatNames.map((stat) => {
      const values: Record<string, number> = {};
      let winnerName: string | null = null;
      let maxVal = -Infinity;

      pokemon.forEach((p) => {
        const s = p.stats.find((st) => st.name === stat);
        const val = s?.baseStat ?? 0;
        values[p.name] = val;
        if (val > maxVal) {
          maxVal = val;
          winnerName = p.name;
        }
      });

      // If tied, no winner
      const maxCount = Object.values(values).filter((v) => v === maxVal).length;
      return {
        stat,
        values,
        winner: maxCount > 1 ? null : winnerName,
      };
    });

    return { pokemon, comparison };
  }
}

// Singleton
export const pokemonService = new PokemonService();
