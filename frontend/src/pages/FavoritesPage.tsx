import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/Button';
import { PokemonCard } from '@/components/pokemon/PokemonCard';

export function FavoritesPage() {
  const navigate = useNavigate();
  const { favorites } = useFavorites();

  if (favorites.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-8xl"
        >
          💔
        </motion.div>
        <h1 className="text-3xl font-bold text-white">No Favorites Yet</h1>
        <p className="text-gray-400 max-w-sm">
          Start exploring Pokémon and tap the heart icon to save your favorites here.
        </p>
        <Button onClick={() => navigate('/')} icon={<Heart className="w-4 h-4" />}>
          Discover Pokémon
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Favorites</h1>
          <p className="text-gray-400 mt-1">{favorites.length} Pokémon saved</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {favorites.map((p, i) => (
          <PokemonCard
            key={p.id}
            pokemon={{
              id: p.id,
              name: p.name,
              sprite: p.sprite,
              url: '',
            }}
            index={i}
            types={p.types}
          />
        ))}
      </div>
    </div>
  );
}
