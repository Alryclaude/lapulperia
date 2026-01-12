import { motion } from 'framer-motion';
import { Search as SearchIcon, X, Sparkles } from 'lucide-react';

// REVAMP: Enhanced SearchBar with vibrant styling
const SearchBar = ({ query, onQueryChange, onSubmit, onClear }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="relative"
    >
      <div className="relative group">
        {/* Glow effect background */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/20 via-cyan-500/10 to-purple-500/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />

        {/* Input container */}
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary-400 transition-colors duration-200" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar productos, pulperías..."
            className="w-full pl-12 pr-12 py-4 text-base bg-dark-100/80 border border-white/[0.08] rounded-2xl text-white placeholder:text-gray-500 focus:bg-dark-100 focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 focus:shadow-[0_0_30px_rgba(220,38,38,0.15)] transition-all duration-300"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-dark-50 hover:bg-primary-500/20 text-gray-400 hover:text-primary-400 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search suggestions hint */}
      {!query && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 mt-3 px-2"
        >
          <Sparkles className="w-4 h-4 text-accent-400" />
          <span className="text-sm text-gray-500">
            Prueba: "leche", "coca cola", "pulpería cerca"
          </span>
        </motion.div>
      )}
    </motion.form>
  );
};

export default SearchBar;
