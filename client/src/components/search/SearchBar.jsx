import { motion } from 'framer-motion';
import { Search as SearchIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar productos, pulperias..."
          className="pl-12 pr-12 py-6 text-lg rounded-2xl border-border focus:border-primary-500"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </motion.form>
  );
};

export default SearchBar;
