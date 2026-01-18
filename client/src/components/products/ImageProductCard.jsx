import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, AlertCircle } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../../constants/categories';

const ImageProductCard = ({ image, index, onUpdate, onRemove }) => {
  const [focused, setFocused] = useState(null);

  const priceNum = parseFloat(image.price);
  const isComplete = image.name?.trim() && image.price !== '' && !isNaN(priceNum) && priceNum > 0;

  const handleChange = (field, value) => {
    onUpdate(index, { ...image, [field]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative bg-dark-100/60 backdrop-blur-sm rounded-xl border ${
        isComplete ? 'border-green-500/30' : 'border-white/10'
      } p-3 transition-colors`}
    >
      {/* Status Badge */}
      <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${
        isComplete ? 'bg-green-500' : 'bg-gray-600'
      }`}>
        {isComplete ? (
          <Check className="w-3.5 h-3.5 text-white" />
        ) : (
          <AlertCircle className="w-3.5 h-3.5 text-white" />
        )}
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(index)}
        className="absolute top-2 left-2 w-6 h-6 rounded-full bg-dark-200/80 hover:bg-red-500/80 flex items-center justify-center transition-colors z-10"
      >
        <X className="w-3.5 h-3.5 text-white" />
      </button>

      {/* Image Preview */}
      <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-dark-200">
        <img
          src={image.preview}
          alt={`Preview ${index + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Form Fields */}
      <div className="space-y-2">
        {/* Name Input */}
        <input
          type="text"
          value={image.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          onFocus={() => setFocused('name')}
          onBlur={() => setFocused(null)}
          placeholder="Nombre *"
          className={`w-full px-3 py-2 bg-dark-200/50 border rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none transition-all ${
            focused === 'name' ? 'border-primary-500/50 ring-1 ring-primary-500/20' : 'border-white/5'
          } ${!image.name?.trim() && image.name !== undefined ? 'border-red-500/50' : ''}`}
        />

        {/* Price Input */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">L</span>
          <input
            type="number"
            value={image.price === 0 || image.price === '' ? '' : image.price}
            onChange={(e) => {
              const val = e.target.value;
              // Guardar como string para permitir edición, se parsea al enviar
              handleChange('price', val === '' ? '' : val);
            }}
            onFocus={() => setFocused('price')}
            onBlur={() => setFocused(null)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className={`w-full pl-7 pr-3 py-2 bg-dark-200/50 border rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none transition-all ${
              focused === 'price' ? 'border-primary-500/50 ring-1 ring-primary-500/20' : 'border-white/5'
            } ${image.price !== undefined && image.price !== '' && parseFloat(image.price) <= 0 ? 'border-red-500/50' : ''}`}
          />
        </div>

        {/* Description Input */}
        <textarea
          value={image.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          onFocus={() => setFocused('description')}
          onBlur={() => setFocused(null)}
          placeholder="Descripción (opcional)"
          rows={2}
          className={`w-full px-3 py-2 bg-dark-200/50 border rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none transition-all resize-none ${
            focused === 'description' ? 'border-primary-500/50 ring-1 ring-primary-500/20' : 'border-white/5'
          }`}
        />

        {/* Category Select */}
        <select
          value={image.category || ''}
          onChange={(e) => handleChange('category', e.target.value)}
          onFocus={() => setFocused('category')}
          onBlur={() => setFocused(null)}
          className={`w-full px-3 py-2 bg-dark-200/50 border rounded-lg text-white text-sm focus:outline-none transition-all ${
            focused === 'category' ? 'border-primary-500/50 ring-1 ring-primary-500/20' : 'border-white/5'
          } ${!image.category ? 'text-gray-500' : ''}`}
        >
          <option value="">Categoría (opcional)</option>
          {PRODUCT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
    </motion.div>
  );
};

export default ImageProductCard;
