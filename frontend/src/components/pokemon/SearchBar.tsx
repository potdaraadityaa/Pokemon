import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, Zap } from 'lucide-react';
import { useDebounce, useClickOutside } from '@/hooks/useUtils';
import { useSearchPokemon } from '@/hooks/usePokemon';
import { useSearchHistory } from '@/hooks/useLocalStorage';
import { formatPokemonName, formatPokemonId } from '@/utils/pokemon';

interface SearchBarProps {
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
  placeholder?: string;
  large?: boolean;
}

export function SearchBar({
  autoFocus = false,
  onSearch,
  placeholder = 'Search Pokémon…',
  large = false,
}: SearchBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounced = useDebounce(query, 300);
  const { history, addHistory, clearHistory } = useSearchHistory();

  useClickOutside(containerRef, () => setOpen(false));

  const { data: suggestions, isLoading } = useSearchPokemon(debounced, 8, debounced.length >= 1);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const handleSelect = (name: string) => {
    addHistory(name);
    setQuery('');
    setOpen(false);
    navigate(`/pokemon/${name}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (onSearch) {
      onSearch(query.trim());
      addHistory(query.trim());
      setOpen(false);
    } else {
      handleSelect(query.trim());
    }
  };

  const showDropdown = open && (query.length > 0 || history.length > 0);

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSearch}>
        <div className={`relative flex items-center glass border border-white/10 hover:border-violet-500/50 focus-within:border-violet-500 transition-all duration-200 rounded-2xl ${large ? 'h-16' : 'h-12'}`}>
          <Search className={`absolute left-4 text-gray-500 ${large ? 'w-6 h-6' : 'w-5 h-5'}`} />
          <input
            ref={inputRef}
            type="text"
            id="search-input"
            name="search-query"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            aria-label={placeholder}
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            aria-controls="search-dropdown-menu"
            role="combobox"
            className={`w-full bg-transparent outline-none text-white placeholder-gray-500 ${large ? 'pl-14 pr-12 text-lg' : 'pl-12 pr-10 text-sm'}`}
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              aria-label="Clear search query"
              className="absolute right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 w-full glass-card rounded-2xl overflow-hidden z-50 border border-white/10 max-h-80 overflow-y-auto"
            id="search-dropdown-menu"
            role="listbox"
            aria-label="Search suggestions"
          >
            {/* Search suggestions */}
            {query.length >= 1 && suggestions?.results && suggestions.results.length > 0 && (
              <div className="p-2">
                <p className="px-3 py-1 text-xs text-gray-500 font-medium uppercase tracking-wider">Results</p>
                {suggestions.results.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p.name)}
                    role="option"
                    aria-selected={false}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-left group"
                  >
                    {p.sprite && (
                      <img src={p.sprite} alt={p.name} className="w-10 h-10 object-contain" />
                    )}
                    <div>
                      <p className="text-sm text-white font-medium group-hover:text-violet-300 transition-colors">
                        {formatPokemonName(p.name)}
                      </p>
                      <p className="text-xs text-gray-500">{formatPokemonId(p.id)}</p>
                    </div>
                    <Zap className="w-3 h-3 text-gray-600 ml-auto group-hover:text-violet-400 transition-colors" />
                  </button>
                ))}
              </div>
            )}

            {/* Loading */}
            {isLoading && query.length >= 1 && (
              <div className="p-4 text-center text-sm text-gray-500" role="status">Searching…</div>
            )}

            {/* No results */}
            {query.length >= 1 && !isLoading && suggestions?.results?.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500" role="status">No Pokémon found for "{query}"</div>
            )}

            {/* Search history */}
            {query.length === 0 && history.length > 0 && (
              <div className="p-2">
                <div className="flex items-center justify-between px-3 py-1">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Recent Searches</p>
                  <button
                    onClick={clearHistory}
                    aria-label="Clear search history"
                    className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    Clear
                  </button>
                </div>
                {history.slice(0, 6).map((h) => (
                  <button
                    key={h.timestamp}
                    onClick={() => handleSelect(h.query)}
                    role="option"
                    aria-selected={false}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-left"
                  >
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-300">{h.query}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
