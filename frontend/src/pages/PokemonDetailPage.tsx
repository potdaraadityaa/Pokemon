import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Heart, GitCompare, Sparkles, Scale, Ruler,
  Zap, Shield, Star, Globe, Egg, Volume2
} from 'lucide-react';
import { usePokemon } from '@/hooks/usePokemon';
import { useFavorites, useRecentPokemon } from '@/hooks/useLocalStorage';
import { PokemonDetailSkeleton } from '@/components/ui/Skeleton';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { Button } from '@/components/ui/Button';
import { StatChart } from '@/components/pokemon/StatChart';
import {
  formatPokemonId, formatPokemonName, formatHeight, formatWeight,
  getPrimaryType, cn, getTypeEffectiveness
} from '@/utils/pokemon';
import { TYPE_GRADIENTS, GENERATION_LABELS } from '@/constants/pokemon';

export function PokemonDetailPage() {
  const { name = '' } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [shiny, setShiny] = useState(false);
  const { data: pokemon, isLoading, isError, error } = usePokemon(name);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addRecent } = useRecentPokemon();

  const { weaknesses, strengths, immunities } = pokemon
    ? getTypeEffectiveness(pokemon.types)
    : { weaknesses: [], strengths: [], immunities: [] };

  const playCry = () => {
    if (!pokemon) return;
    const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemon.id}.ogg`;
    const audio = new Audio(cryUrl);
    audio.volume = 0.35;
    audio.play().catch((err) => console.log('Audio cry playback failed:', err));
  };

  useEffect(() => {
    if (pokemon) {
      addRecent({
        id: pokemon.id,
        name: pokemon.name,
        sprite: pokemon.sprites.officialArtwork ?? pokemon.sprites.frontDefault,
        types: pokemon.types,
      });
    }
  }, [pokemon?.name]);

  if (isLoading) return <PokemonDetailSkeleton />;

  if (isError || !pokemon) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center">
        <div className="text-8xl">😵</div>
        <h1 className="text-3xl font-bold text-white">Pokémon Not Found</h1>
        <p className="text-gray-400 max-w-sm">
          {(error as Error)?.message ?? `We couldn't find "${name}". Check the name and try again.`}
        </p>
        <Button onClick={() => navigate('/')} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Home
        </Button>
      </div>
    );
  }

  const primaryType = getPrimaryType(pokemon.types);
  const gradient = TYPE_GRADIENTS[primaryType] ?? TYPE_GRADIENTS['normal'];
  const favorite = isFavorite(pokemon.id);

  const currentSprite = shiny
    ? (pokemon.sprites.frontShiny ?? pokemon.sprites.officialArtwork)
    : (pokemon.sprites.officialArtwork ?? pokemon.sprites.frontDefault);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl overflow-hidden"
      >
        {/* Gradient header */}
        <div className={cn('h-32 bg-gradient-to-br', gradient, 'relative')}>
          <div className="absolute inset-0 pokeball-bg" />
          {/* Floating badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {pokemon.isLegendary && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-xs font-bold">
                <Star className="w-3 h-3 fill-yellow-300" /> Legendary
              </span>
            )}
            {pokemon.isMythical && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold">
                <Sparkles className="w-3 h-3" /> Mythical
              </span>
            )}
          </div>
        </div>

        <div className="px-6 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 -mt-16 md:-mt-20">
            {/* Sprite */}
            <div className="flex flex-col items-center gap-4">
              <motion.div
                className="relative"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className={cn('absolute inset-0 rounded-full blur-3xl opacity-30 bg-gradient-to-br', gradient)} />
                <img
                  src={currentSprite ?? ''}
                  alt={pokemon.name}
                  className="relative w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/pokeball-placeholder.svg'; }}
                />
              </motion.div>

              {/* Controls */}
              <div className="flex gap-2.5 flex-wrap">
                {pokemon.sprites.frontShiny && (
                  <button
                    onClick={() => setShiny(!shiny)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border',
                      shiny
                        ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300'
                        : 'glass border-white/10 text-gray-400 hover:text-white hover:border-white/20',
                    )}
                  >
                    <Sparkles className="w-4 h-4" />
                    {shiny ? 'Shiny ✨' : 'View Shiny'}
                  </button>
                )}

                <button
                  onClick={playCry}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border glass border-white/10 text-gray-400 hover:text-white hover:border-violet-500/40"
                  aria-label="Play Pokémon Cry Audio"
                >
                  <Volume2 className="w-4 h-4 text-violet-400" />
                  Play Cry
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="pt-4 md:pt-0 space-y-5">
              <div>
                <p className="text-sm text-gray-500 font-mono">{formatPokemonId(pokemon.id)}</p>
                <h1 className="text-4xl font-black text-white mt-1">
                  {formatPokemonName(pokemon.name)}
                </h1>
                {pokemon.genus && (
                  <p className="text-gray-400 text-sm mt-1">{pokemon.genus}</p>
                )}
              </div>

              {/* Types */}
              <div className="flex gap-2 flex-wrap">
                {pokemon.types.map((t) => <TypeBadge key={t} type={t} size="lg" />)}
              </div>

              {/* Description */}
              {pokemon.description && (
                <p className="text-gray-300 text-sm leading-relaxed glass rounded-xl p-4 border border-white/5">
                  {pokemon.description}
                </p>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <InfoCard icon={<Ruler className="w-4 h-4 text-blue-400" />} label="Height" value={formatHeight(pokemon.height)} />
                <InfoCard icon={<Scale className="w-4 h-4 text-green-400" />} label="Weight" value={formatWeight(pokemon.weight)} />
                <InfoCard icon={<Zap className="w-4 h-4 text-yellow-400" />} label="Base XP" value={pokemon.baseExperience?.toString() ?? '—'} />
                <InfoCard icon={<Shield className="w-4 h-4 text-purple-400" />} label="Capture Rate" value={pokemon.captureRate?.toString() ?? '—'} />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 flex-wrap">
                <Button
                  variant={favorite ? 'danger' : 'secondary'}
                  icon={<Heart className={cn('w-4 h-4', favorite && 'fill-current')} />}
                  onClick={() => toggleFavorite({
                    id: pokemon.id,
                    name: pokemon.name,
                    sprite: pokemon.sprites.officialArtwork ?? pokemon.sprites.frontDefault,
                    types: pokemon.types,
                  })}
                >
                  {favorite ? 'Unfavorite' : 'Favorite'}
                </Button>
                <Button
                  variant="secondary"
                  icon={<GitCompare className="w-4 h-4" />}
                  onClick={() => navigate(`/compare?a=${pokemon.name}`)}
                >
                  Compare
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Base Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-3xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" /> Base Stats
          </h2>
          <StatChart stats={pokemon.stats} />
        </motion.div>

        {/* Abilities & Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Abilities */}
          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" /> Abilities
            </h2>
            <div className="space-y-2">
              {pokemon.abilities.map((a) => (
                <div key={a.name} className="flex items-center justify-between glass rounded-xl px-4 py-2.5">
                  <span className="text-sm text-white font-medium">{formatPokemonName(a.name)}</span>
                  {a.isHidden && (
                    <span className="text-xs text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full">Hidden</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Species Info */}
          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-400" /> Species Info
            </h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {pokemon.generation && (
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Generation</p>
                  <p className="text-white font-medium">{GENERATION_LABELS[pokemon.generation] ?? pokemon.generation}</p>
                </div>
              )}
              {pokemon.habitat && (
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Habitat</p>
                  <p className="text-white font-medium capitalize">{pokemon.habitat}</p>
                </div>
              )}
              {pokemon.color && (
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Color</p>
                  <p className="text-white font-medium capitalize">{pokemon.color}</p>
                </div>
              )}
              {pokemon.shape && (
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Shape</p>
                  <p className="text-white font-medium capitalize">{pokemon.shape}</p>
                </div>
              )}
              {pokemon.evolvesFrom && (
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs mb-0.5">Evolves From</p>
                  <button
                    onClick={() => navigate(`/pokemon/${pokemon.evolvesFrom}`)}
                    className="text-violet-400 hover:text-violet-300 font-medium capitalize transition-colors"
                  >
                    {formatPokemonName(pokemon.evolvesFrom)}
                  </button>
                </div>
              )}
              {pokemon.eggGroups && pokemon.eggGroups.length > 0 && (
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs mb-1.5">Egg Groups</p>
                  <div className="flex gap-2 flex-wrap">
                    {pokemon.eggGroups.map((eg) => (
                      <span key={eg} className="text-xs glass px-2.5 py-1 rounded-full capitalize">{eg}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Type Effectiveness */}
          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-rose-400" /> Type Effectiveness
            </h2>
            <div className="space-y-4 text-sm">
              {weaknesses.length > 0 && (
                <div>
                  <p className="text-gray-500 text-xs mb-2">Takes Double Damage From (Weakness)</p>
                  <div className="flex gap-2 flex-wrap">
                    {weaknesses.map((w) => (
                      <TypeBadge key={w} type={w} size="sm" />
                    ))}
                  </div>
                </div>
              )}
              {strengths.length > 0 && (
                <div>
                  <p className="text-gray-500 text-xs mb-2">Takes Half Damage From (Resistance)</p>
                  <div className="flex gap-2 flex-wrap">
                    {strengths.map((s) => (
                      <TypeBadge key={s} type={s} size="sm" />
                    ))}
                  </div>
                </div>
              )}
              {immunities.length > 0 && (
                <div>
                  <p className="text-gray-500 text-xs mb-2">Takes No Damage From (Immunity)</p>
                  <div className="flex gap-2 flex-wrap">
                    {immunities.map((i) => (
                      <TypeBadge key={i} type={i} size="sm" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Moves */}
      {pokemon.moves.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-3xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Egg className="w-5 h-5 text-orange-400" /> Moves (First 20)
          </h2>
          <div className="flex flex-wrap gap-2">
            {pokemon.moves.map((move) => (
              <span key={move} className="glass px-3 py-1.5 rounded-xl text-sm text-gray-300 capitalize hover:text-white hover:bg-white/5 transition-colors cursor-default">
                {formatPokemonName(move)}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-3 flex items-center gap-3">
      <div className="p-2 rounded-lg bg-white/5">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}
