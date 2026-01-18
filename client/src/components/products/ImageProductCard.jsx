import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle, Package, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../../constants/categories';

const ImageProductCard = ({ image, index, onUpdate, onRemove }) => {
  const [focused, setFocused] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showZoom, setShowZoom] = useState(false);

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

      {/* Image Preview with Zoom */}
      <div
        className="aspect-square rounded-lg overflow-hidden mb-3 bg-dark-200 relative cursor-pointer group"
        onMouseEnter={() => setShowZoom(true)}
        onMouseLeave={() => setShowZoom(false)}
      >
        <img
          src={image.preview}
          alt={`Preview ${index + 1}`}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
        {/* File size indicator */}
        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-gray-300">
          {(image.file.size / 1024).toFixed(0)}KB
        </div>
      </div>

      {/* Zoom Preview Modal */}
      <AnimatePresence>
        {showZoom && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none"
          >
            <img
              src={image.preview}
              alt={`Preview ${index + 1}`}
              className="max-w-[80vw] max-h-[80vh] object-contain rounded-xl shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

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

        {/* Advanced Options Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          {showAdvanced ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              Menos opciones
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              Más opciones
            </>
          )}
        </button>

        {/* Advanced Fields */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2 overflow-hidden"
            >
              {/* Stock Quantity */}
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input
                  type="number"
                  value={image.stockQuantity || ''}
                  onChange={(e) => handleChange('stockQuantity', e.target.value)}
                  onFocus={() => setFocused('stock')}
                  onBlur={() => setFocused(null)}
                  placeholder="Stock inicial"
                  min="0"
                  className={`w-full pl-8 pr-3 py-2 bg-dark-200/50 border rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none transition-all ${
                    focused === 'stock' ? 'border-primary-500/50 ring-1 ring-primary-500/20' : 'border-white/5'
                  }`}
                />
              </div>

              {/* SKU */}
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input
                  type="text"
                  value={image.sku || ''}
                  onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
                  onFocus={() => setFocused('sku')}
                  onBlur={() => setFocused(null)}
                  placeholder="SKU (opcional)"
                  maxLength={20}
                  className={`w-full pl-8 pr-3 py-2 bg-dark-200/50 border rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none transition-all uppercase ${
                    focused === 'sku' ? 'border-primary-500/50 ring-1 ring-primary-500/20' : 'border-white/5'
                  }`}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ImageProductCard;
