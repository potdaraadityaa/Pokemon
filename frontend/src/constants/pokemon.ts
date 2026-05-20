// Pokemon type → color/gradient mappings for UI theming
export const TYPE_COLORS: Record<string, string> = {
  fire: '#FF6B35',
  water: '#4FC3F7',
  grass: '#66BB6A',
  electric: '#FFCA28',
  psychic: '#EC407A',
  ice: '#80DEEA',
  dragon: '#7E57C2',
  dark: '#5D4037',
  fairy: '#F48FB1',
  fighting: '#EF5350',
  poison: '#AB47BC',
  ground: '#BCAAA4',
  rock: '#8D6E63',
  bug: '#9CCC65',
  ghost: '#5C6BC0',
  steel: '#78909C',
  normal: '#BDBDBD',
  flying: '#90CAF9',
};

export const TYPE_GRADIENTS: Record<string, string> = {
  fire: 'from-orange-600/20 via-red-600/10 to-transparent',
  water: 'from-blue-600/20 via-cyan-600/10 to-transparent',
  grass: 'from-green-600/20 via-emerald-600/10 to-transparent',
  electric: 'from-yellow-500/20 via-amber-500/10 to-transparent',
  psychic: 'from-pink-600/20 via-rose-600/10 to-transparent',
  ice: 'from-cyan-400/20 via-sky-400/10 to-transparent',
  dragon: 'from-violet-600/20 via-purple-600/10 to-transparent',
  dark: 'from-gray-800/40 via-gray-700/20 to-transparent',
  fairy: 'from-pink-400/20 via-fuchsia-400/10 to-transparent',
  fighting: 'from-red-700/20 via-red-600/10 to-transparent',
  poison: 'from-purple-600/20 via-violet-600/10 to-transparent',
  ground: 'from-amber-700/20 via-yellow-700/10 to-transparent',
  rock: 'from-stone-600/20 via-stone-500/10 to-transparent',
  bug: 'from-lime-600/20 via-green-600/10 to-transparent',
  ghost: 'from-indigo-700/20 via-indigo-600/10 to-transparent',
  steel: 'from-slate-500/20 via-slate-400/10 to-transparent',
  normal: 'from-gray-500/20 via-gray-400/10 to-transparent',
  flying: 'from-sky-400/20 via-blue-400/10 to-transparent',
};

export const TYPE_BG_CLASSES: Record<string, string> = {
  fire: 'bg-orange-500',
  water: 'bg-blue-500',
  grass: 'bg-green-500',
  electric: 'bg-yellow-500',
  psychic: 'bg-pink-500',
  ice: 'bg-cyan-400',
  dragon: 'bg-violet-600',
  dark: 'bg-gray-700',
  fairy: 'bg-pink-400',
  fighting: 'bg-red-600',
  poison: 'bg-purple-500',
  ground: 'bg-amber-600',
  rock: 'bg-stone-500',
  bug: 'bg-lime-500',
  ghost: 'bg-indigo-600',
  steel: 'bg-slate-500',
  normal: 'bg-gray-400',
  flying: 'bg-sky-400',
};

export const STAT_COLORS: Record<string, string> = {
  hp: 'bg-green-400',
  attack: 'bg-red-400',
  defense: 'bg-blue-400',
  'special-attack': 'bg-purple-400',
  'special-defense': 'bg-cyan-400',
  speed: 'bg-yellow-400',
};

export const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'Sp.ATK',
  'special-defense': 'Sp.DEF',
  speed: 'SPD',
};

export const GENERATION_LABELS: Record<string, string> = {
  'generation-i': 'Generation I',
  'generation-ii': 'Generation II',
  'generation-iii': 'Generation III',
  'generation-iv': 'Generation IV',
  'generation-v': 'Generation V',
  'generation-vi': 'Generation VI',
  'generation-vii': 'Generation VII',
  'generation-viii': 'Generation VIII',
  'generation-ix': 'Generation IX',
};

export const MAX_FAVORITES = 50;
export const MAX_RECENT = 10;
export const SEARCH_DEBOUNCE_MS = 350;
export const DEFAULT_SEARCH_LIMIT = 20;
