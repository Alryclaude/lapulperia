import { motion } from 'framer-motion';
import { Store, Utensils, Coffee, Pill, ShoppingBag } from 'lucide-react';

const categories = [
  { id: 'all', label: 'Todos', icon: Store },
  { id: 'food', label: 'Comida', icon: Utensils },
  { id: 'drinks', label: 'Bebidas', icon: Coffee },
  { id: 'pharmacy', label: 'Farmacia', icon: Pill },
  { id: 'groceries', label: 'Abarrotes', icon: ShoppingBag },
];

const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-gray-400 px-1">
        Categorias populares
      </h2>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          return (
            <motion.button
              key={category.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCategoryChange(category.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-primary-500 text-white shadow-primary'
                  : 'bg-dark-100 border border-white/5 text-gray-300 hover:border-primary-500/30 hover:bg-dark-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{category.label}</span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryFilter;
