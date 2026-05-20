import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { useFavorites } from '@/hooks/useLocalStorage';
import { formatPokemonId, formatPokemonName, getPrimaryType, cn } from '@/utils/pokemon';
import { TYPE_GRADIENTS } from '@/constants/pokemon';
import type { PokemonListItem } from '@/types/pokemon';

interface PokemonCardProps {
  pokemon: PokemonListItem;
  index?: number;
  types?: string[];
}

export function PokemonCard({ pokemon, index = 0, types = [] }: PokemonCardProps) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const primaryType = getPrimaryType(types);
  const gradient = TYPE_GRADIENTS[primaryType] ?? TYPE_GRADIENTS['normal'];
  const favorite = isFavorite(pokemon.id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite({
      id: pokemon.id,
      name: pokemon.name,
      sprite: pokemon.sprite,
      types,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={() => navigate(`/pokemon/${pokemon.name}`)}
      className="glass-card rounded-2xl p-4 cursor-pointer group relative overflow-hidden"
    >
      {/* Type gradient overlay */}
      <div className={cn('absolute inset-0 bg-gradient-to-br', gradient, 'opacity-60 rounded-2xl')} />

      {/* Pokeball bg decoration */}
      <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full border-[12px] border-white/5" />
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full border-[8px] border-white/5" />

      {/* Favorite button */}
      <button
        onClick={handleFavorite}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-full glass transition-all duration-200 hover:scale-110"
        aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart
          className={cn(
            'w-4 h-4 transition-colors',
            favorite ? 'fill-red-400 text-red-400' : 'text-gray-500 group-hover:text-gray-300',
          )}
        />
      </button>

      {/* Content */}
      <div className="relative z-10">
        {/* ID */}
        <p className="text-xs text-gray-500 font-mono mb-1">{formatPokemonId(pokemon.id)}</p>

        {/* Sprite */}
        <div className="relative w-full aspect-square flex items-center justify-center mb-3">
          {pokemon.sprite ? (
            <motion.img
              src={pokemon.sprite}
              alt={pokemon.name}
              className="w-4/5 h-4/5 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/pokeball-placeholder.svg';
              }}
            />
          ) : (
            <div className="w-4/5 h-4/5 rounded-full bg-white/5 flex items-center justify-center">
              <span className="text-4xl">?</span>
            </div>
          )}
        </div>

        {/* Name */}
        <h3 className="text-center font-bold text-white text-sm mb-2 group-hover:text-violet-300 transition-colors">
          {formatPokemonName(pokemon.name)}
        </h3>

        {/* Types */}
        <div className="flex gap-1.5 justify-center flex-wrap">
          {types.map((t) => (
            <TypeBadge key={t} type={t} size="sm" />
          ))}
          {types.length === 0 && (
            <span className="text-xs text-gray-600">—</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
