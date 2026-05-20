import { Github, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/5 mt-auto py-8 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-red-500 relative overflow-hidden shrink-0">
            <div className="absolute inset-0 flex flex-col">
              <div className="flex-1 bg-red-500" />
              <div className="h-0.5 bg-white" />
              <div className="flex-1 bg-white" />
            </div>
          </div>
          <span>Pokédex — Powered by <a href="https://pokeapi.co" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 transition-colors">PokéAPI</a></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" /> for Pokémon fans
          </span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
