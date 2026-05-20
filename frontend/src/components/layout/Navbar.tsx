import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, GitCompare, Home, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { SearchBar } from '@/components/pokemon/SearchBar';
import { cn } from '@/utils/pokemon';

const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/favorites', label: 'Favorites', icon: Heart },
  { to: '/compare', label: 'Compare', icon: GitCompare },
];

export function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-40 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30 relative overflow-hidden">
            <div className="absolute inset-0 flex flex-col">
              <div className="flex-1 bg-red-500" />
              <div className="h-0.5 bg-white" />
              <div className="flex-1 bg-white" />
            </div>
            <div className="relative w-3 h-3 rounded-full bg-white border-2 border-gray-300 z-10" />
          </div>
          <span className="font-bold text-white hidden sm:block">
            Pokédex
          </span>
        </Link>

        {/* Search bar — hide on home (has its own) */}
        {!isHome && (
          <div className="flex-1 max-w-md hidden md:block">
            <SearchBar />
          </div>
        )}

        <div className="flex-1 md:flex-none" />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                location.pathname === to
                  ? 'bg-violet-600/20 text-violet-300'
                  : 'text-gray-400 hover:text-white hover:bg-white/5',
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-xl glass"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-white/5 px-4 py-3 space-y-1"
        >
          {!isHome && (
            <div className="pb-3">
              <SearchBar />
            </div>
          )}
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                location.pathname === to
                  ? 'bg-violet-600/20 text-violet-300'
                  : 'text-gray-400 hover:text-white hover:bg-white/5',
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </motion.div>
      )}
    </header>
  );
}
