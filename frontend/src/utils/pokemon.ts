import { TYPE_BG_CLASSES, TYPE_COLORS } from '@/constants/pokemon';

export function formatPokemonId(id: number): string {
  return `#${String(id).padStart(4, '0')}`;
}

export function formatPokemonName(name: string): string {
  return name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function formatHeight(decimetres: number): string {
  const cm = decimetres * 10;
  const feet = Math.floor(cm / 30.48);
  const inches = Math.round((cm % 30.48) / 2.54);
  return `${(decimetres / 10).toFixed(1)}m / ${feet}'${inches}"`;
}

export function formatWeight(hectograms: number): string {
  const kg = hectograms / 10;
  const lbs = (kg * 2.20462).toFixed(1);
  return `${kg.toFixed(1)}kg / ${lbs}lbs`;
}

export function getTypeBgClass(type: string): string {
  return TYPE_BG_CLASSES[type] ?? 'bg-gray-500';
}

export function getTypeColor(type: string): string {
  return TYPE_COLORS[type] ?? '#9CA3AF';
}

export function getPrimaryType(types: string[]): string {
  return types[0] ?? 'normal';
}

export function getStatMax(statName: string): number {
  if (statName === 'hp') return 255;
  if (statName === 'speed') return 200;
  return 190;
}

export function getStatPercent(stat: number, statName: string): number {
  return Math.min((stat / getStatMax(statName)) * 100, 100);
}

export function formatStatName(name: string): string {
  const map: Record<string, string> = {
    hp: 'HP',
    attack: 'ATK',
    defense: 'DEF',
    'special-attack': 'Sp.ATK',
    'special-defense': 'Sp.DEF',
    speed: 'SPD',
  };
  return map[name] ?? name;
}

export function getGenderFromRate(genderRate: number | undefined): string {
  if (genderRate === undefined || genderRate < 0) return 'Genderless';
  if (genderRate === 0) return '100% ♂';
  if (genderRate === 8) return '100% ♀';
  const femalePercent = (genderRate / 8) * 100;
  return `${100 - femalePercent}% ♂ / ${femalePercent}% ♀`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

const TYPE_EFFECTIVENESS: Record<string, { weaknesses: string[]; resistances: string[]; immunities: string[] }> = {
  normal: { weaknesses: ['fighting'], resistances: [], immunities: ['ghost'] },
  fire: { weaknesses: ['water', 'ground', 'rock'], resistances: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'], immunities: [] },
  water: { weaknesses: ['grass', 'electric'], resistances: ['fire', 'water', 'ice', 'steel'], immunities: [] },
  grass: { weaknesses: ['fire', 'ice', 'poison', 'flying', 'bug'], resistances: ['water', 'grass', 'electric', 'ground'], immunities: [] },
  electric: { weaknesses: ['ground'], resistances: ['electric', 'flying', 'steel'], immunities: [] },
  ice: { weaknesses: ['fire', 'fighting', 'rock', 'steel'], resistances: ['ice'], immunities: [] },
  fighting: { weaknesses: ['flying', 'psychic', 'fairy'], resistances: ['bug', 'rock', 'dark'], immunities: [] },
  poison: { weaknesses: ['ground', 'psychic'], resistances: ['grass', 'fighting', 'poison', 'bug', 'fairy'], immunities: [] },
  ground: { weaknesses: ['water', 'grass', 'ice'], resistances: ['poison', 'rock'], immunities: ['electric'] },
  flying: { weaknesses: ['electric', 'ice', 'rock'], resistances: ['grass', 'fighting', 'bug'], immunities: ['ground'] },
  psychic: { weaknesses: ['bug', 'ghost', 'dark'], resistances: ['fighting', 'psychic'], immunities: [] },
  bug: { weaknesses: ['fire', 'flying', 'rock'], resistances: ['grass', 'fighting', 'ground'], immunities: [] },
  rock: { weaknesses: ['water', 'grass', 'fighting', 'ground', 'steel'], resistances: ['normal', 'fire', 'poison', 'flying'], immunities: [] },
  ghost: { weaknesses: ['ghost', 'dark'], resistances: ['poison', 'bug'], immunities: ['normal', 'fighting'] },
  dragon: { weaknesses: ['ice', 'dragon', 'fairy'], resistances: ['fire', 'water', 'grass', 'electric'], immunities: [] },
  dark: { weaknesses: ['fighting', 'bug', 'fairy'], resistances: ['ghost', 'dark'], immunities: ['psychic'] },
  steel: { weaknesses: ['fire', 'fighting', 'ground'], resistances: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'], immunities: ['poison'] },
  fairy: { weaknesses: ['poison', 'steel'], resistances: ['fighting', 'bug', 'dark'], immunities: ['dragon'] }
};

export function getTypeEffectiveness(types: string[]): { weaknesses: string[]; strengths: string[]; immunities: string[] } {
  const multipliers: Record<string, number> = {};
  const allTypes = Object.keys(TYPE_EFFECTIVENESS);
  
  for (const t of allTypes) {
    multipliers[t] = 1.0;
  }

  for (const activeType of types) {
    const rules = TYPE_EFFECTIVENESS[activeType.toLowerCase()];
    if (!rules) continue;

    for (const weak of rules.weaknesses) multipliers[weak] *= 2.0;
    for (const res of rules.resistances) multipliers[res] *= 0.5;
    for (const imm of rules.immunities) multipliers[imm] *= 0.0;
  }

  const weaknesses: string[] = [];
  const strengths: string[] = [];
  const immunities: string[] = [];

  for (const [type, mult] of Object.entries(multipliers)) {
    if (mult > 1.0) {
      weaknesses.push(type);
    } else if (mult > 0.0 && mult < 1.0) {
      strengths.push(type);
    } else if (mult === 0.0) {
      immunities.push(type);
    }
  }

  return { weaknesses, strengths, immunities };
}

