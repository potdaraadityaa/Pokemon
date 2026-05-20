import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, TrendingUp, ChevronDown } from 'lucide-react';
import { SearchBar } from '@/components/pokemon/SearchBar';
import { PokemonCard } from '@/components/pokemon/PokemonCard';
import { PokemonCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { usePokemon, useSearchPokemon, useRandomPokemon } from '@/hooks/usePokemon';
import { useRecentPokemon } from '@/hooks/useLocalStorage';
import { useDebounce } from '@/hooks/useUtils';
import { formatPokemonName } from '@/utils/pokemon';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

const FEATURED = ['pikachu', 'charizard', 'mewtwo', 'umbreon', 'gardevoir', 'lucario', 'gengar', 'eevee'];

export function HomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebounce(searchQuery, 350);
  const { recent } = useRecentPokemon();

  const { data: searchResults, isLoading: searchLoading } = useSearchPokemon(
    debounced,
    20,
    debounced.length >= 1,
  );

  // Random Pokémon query — refetched manually on button click
  const { data: randomData, isFetching: randomLoading, refetch: refetchRandom } = useRandomPokemon();

  const handleRandom = useCallback(() => {
    refetchRandom();
  }, [refetchRandom]);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    setPage(1);
  }, []);

  const isSearching = debounced.length >= 1;

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative text-center py-16 md:py-24">
        {/* Decorative orbs */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-violet-500/30 text-violet-300 text-sm font-medium mb-6">
            <TrendingUp className="w-4 h-4" />
            1,302 Pokémon Available
          </span>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight">
            The Ultimate{' '}
            <span className="gradient-text">Pokédex</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto mb-10">
            Search, explore, and compare all Pokémon. Powered by real-time data with blazing-fast caching.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto">
            <SearchBar
              large
              autoFocus
              placeholder="Search by name or Pokédex ID…"
              onSearch={handleSearch}
            />
          </div>

          {/* Random button */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button
              variant="secondary"
              icon={<Shuffle className="w-4 h-4" />}
              onClick={handleRandom}
              loading={randomLoading}
            >
              Random Pokémon
            </Button>
          </div>

          {/* Random result */}
          <AnimatePresence>
            {randomData && !randomLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mt-6 inline-block cursor-pointer"
                onClick={() => navigate(`/pokemon/${randomData.name}`)}
              >
                <div className="glass-card rounded-2xl p-4 flex items-center gap-4 hover:border-violet-500/30 border border-white/10 transition-all">
                  <img
                    src={randomData.sprites.officialArtwork ?? randomData.sprites.frontDefault ?? ''}
                    alt={randomData.name}
                    className="w-16 h-16 object-contain"
                  />
                  <div className="text-left">
                    <p className="text-xs text-gray-500 font-mono">#{String(randomData.id).padStart(4, '0')}</p>
                    <p className="font-bold text-white">{formatPokemonName(randomData.name)}</p>
                    <p className="text-xs text-violet-400 mt-0.5">Click to view →</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Search Results */}
      <AnimatePresence mode="wait">
        {isSearching && (
          <motion.section
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-xl font-bold text-white mb-6">
              {searchLoading
                ? 'Searching…'
                : `${searchResults?.total ?? 0} results for "${debounced}"`}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {searchLoading
                ? [...Array(12)].map((_, i) => <PokemonCardSkeleton key={i} />)
                : searchResults?.results.map((p, i) => (
                    <PokemonCard key={p.id} pokemon={p} index={i} />
                  ))}
              {!searchLoading && searchResults?.results.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-400 text-lg">No Pokémon found for "{debounced}"</p>
                  <p className="text-gray-600 text-sm mt-2">Try a different name or Pokédex number</p>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* Recently Viewed */}
        {!isSearching && recent.length > 0 && (
          <motion.section
            key="recent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-400" />
              Recently Viewed
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {recent.map((p, i) => (
                <PokemonCard
                  key={p.id}
                  pokemon={{ id: p.id, name: p.name, sprite: p.sprite, url: '' }}
                  index={i}
                  types={p.types}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* Featured if no search and no recent */}
        {!isSearching && recent.length === 0 && (
          <motion.section
            key="featured"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              Featured Pokémon
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {FEATURED.map((name, i) => (
                <FeaturedCard key={name} name={name} index={i} />
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

function FeaturedCard({ name, index }: { name: string; index: number }) {
  const { data: pokemon, isLoading } = usePokemon(name);
  if (isLoading) return <PokemonCardSkeleton />;
  if (!pokemon) return null;
  return (
    <PokemonCard
      pokemon={{
        id: pokemon.id,
        name: pokemon.name,
        sprite: pokemon.sprites.officialArtwork ?? pokemon.sprites.frontDefault,
        url: '',
      }}
      index={index}
      types={pokemon.types}
    />
  );
}
