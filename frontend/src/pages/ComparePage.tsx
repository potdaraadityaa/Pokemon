import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Plus, X, GitCompare, Trophy, Minus } from 'lucide-react';
import { useComparePokemon } from '@/hooks/usePokemon';
import { SearchBar } from '@/components/pokemon/SearchBar';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { Button } from '@/components/ui/Button';
import { StatChart } from '@/components/pokemon/StatChart';
import { formatPokemonId, formatPokemonName, formatHeight, formatWeight, getPrimaryType, cn } from '@/utils/pokemon';
import { STAT_LABELS, TYPE_GRADIENTS } from '@/constants/pokemon';

export function ComparePage() {
  const [params] = useSearchParams();
  const initialA = params.get('a') ?? '';
  const [selected, setSelected] = useState<string[]>(initialA ? [initialA] : []);
  const [inputVal, setInputVal] = useState('');

  const { data, isLoading, isError } = useComparePokemon(selected, selected.length >= 2);

  const addPokemon = (name: string) => {
    if (!name.trim()) return;
    const lower = name.trim().toLowerCase();
    if (selected.includes(lower)) return;
    if (selected.length >= 4) return;
    setSelected([...selected, lower]);
    setInputVal('');
  };

  const removePokemon = (name: string) => {
    setSelected(selected.filter((s) => s !== name));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <GitCompare className="w-8 h-8 text-violet-400" />
          Compare Pokémon
        </h1>
        <p className="text-gray-400 mt-1">Select 2–4 Pokémon to compare stats side-by-side</p>
      </div>

      {/* Selector */}
      <div className="glass-card rounded-3xl p-6 space-y-4">
        <div className="flex flex-wrap gap-3">
          {selected.map((name) => (
            <div key={name} className="flex items-center gap-2 glass px-3 py-2 rounded-xl border border-violet-500/30">
              <span className="text-sm text-white font-medium capitalize">{formatPokemonName(name)}</span>
              <button onClick={() => removePokemon(name)} className="text-gray-500 hover:text-red-400 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {selected.length < 4 && (
            <div className="flex-1 min-w-48">
              <SearchBar
                placeholder={`Add Pokémon ${selected.length + 1}…`}
                onSearch={addPokemon}
              />
            </div>
          )}
        </div>
        {selected.length === 0 && (
          <p className="text-gray-600 text-sm">Try: pikachu, mewtwo, charizard, …</p>
        )}
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {isLoading && selected.length >= 2 && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading comparison…</p>
          </motion.div>
        )}

        {isError && (
          <motion.div key="error" className="glass-card rounded-3xl p-8 text-center">
            <p className="text-red-400">Failed to compare. Check that all Pokémon names are valid.</p>
          </motion.div>
        )}

        {data && !isLoading && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Pokemon portraits */}
            <div className={`grid gap-4 grid-cols-${data.pokemon.length}`} style={{ gridTemplateColumns: `repeat(${data.pokemon.length}, 1fr)` }}>
              {data.pokemon.map((p) => {
                const primaryType = getPrimaryType(p.types);
                const gradient = TYPE_GRADIENTS[primaryType] ?? '';
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn('glass-card rounded-2xl p-4 text-center bg-gradient-to-b', gradient)}
                  >
                    <img
                      src={p.sprites.officialArtwork ?? p.sprites.frontDefault ?? ''}
                      alt={p.name}
                      className="w-24 h-24 mx-auto object-contain"
                    />
                    <p className="text-xs text-gray-500 font-mono">{formatPokemonId(p.id)}</p>
                    <p className="font-bold text-white text-sm">{formatPokemonName(p.name)}</p>
                    <div className="flex gap-1 justify-center mt-2 flex-wrap">
                      {p.types.map((t) => <TypeBadge key={t} type={t} size="sm" />)}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Stat comparison */}
            <div className="glass-card rounded-3xl p-6 overflow-x-auto">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" /> Stat Comparison
              </h2>
              <table className="w-full min-w-[400px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs text-gray-500 pb-3 w-24">Stat</th>
                    {data.pokemon.map((p) => (
                      <th key={p.id} className="text-center text-xs text-gray-400 pb-3 capitalize font-medium">
                        {formatPokemonName(p.name)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.comparison.map((row) => (
                    <tr key={row.stat} className="border-b border-white/5">
                      <td className="py-3 text-xs text-gray-400 font-medium">
                        {STAT_LABELS[row.stat] ?? row.stat}
                      </td>
                      {data.pokemon.map((p) => {
                        const val = row.values[p.name] ?? 0;
                        const isWinner = row.winner === p.name;
                        return (
                          <td key={p.id} className="py-3 text-center">
                            <span className={cn(
                              'text-sm font-bold tabular-nums',
                              isWinner ? 'text-green-400' : 'text-gray-400',
                            )}>
                              {isWinner && <Trophy className="w-3 h-3 inline mr-1 text-yellow-400" />}
                              {val}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr className="border-t border-white/20">
                    <td className="pt-3 text-xs text-gray-300 font-bold">Total</td>
                    {data.pokemon.map((p) => {
                      const total = p.stats.reduce((s, stat) => s + stat.baseStat, 0);
                      const maxTotal = Math.max(...data.pokemon.map(pk => pk.stats.reduce((s, stat) => s + stat.baseStat, 0)));
                      return (
                        <td key={p.id} className="pt-3 text-center">
                          <span className={cn('text-sm font-bold', total === maxTotal ? 'text-violet-400' : 'text-gray-400')}>
                            {total}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {selected.length < 2 && (
          <motion.div
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-3xl p-12 text-center"
          >
            <div className="text-6xl mb-4">⚖️</div>
            <p className="text-gray-400">Add at least 2 Pokémon above to start comparing</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
