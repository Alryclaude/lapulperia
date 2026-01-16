import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt,
  Plus,
  Minus,
  Trash2,
  Share2,
  MessageCircle,
  Copy,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Generador de Recibos - Para compartir por WhatsApp
const ReceiptGenerator = ({ businessName = 'Mi Negocio', onShare }) => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', price: '', quantity: 1 });
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const receiptRef = useRef(null);

  const receiptNumber = `#${Date.now().toString().slice(-6)}`;

  const addItem = () => {
    const price = parseFloat(newItem.price);
    if (!newItem.name.trim() || isNaN(price) || price <= 0) return;

    setItems([
      ...items,
      {
        id: Date.now(),
        name: newItem.name.trim(),
        price,
        quantity: newItem.quantity || 1,
      },
    ]);

    setNewItem({ name: '', price: '', quantity: 1 });
  };

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const formatCurrency = (value) => {
    return `L. ${value.toFixed(2)}`;
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('es-HN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Generar texto del recibo para compartir
  const generateReceiptText = () => {
    let text = `📋 *RECIBO ${receiptNumber}*\n`;
    text += `🏪 ${businessName}\n`;
    text += `📅 ${formatDate()}\n`;
    text += `━━━━━━━━━━━━━━━━━\n\n`;

    items.forEach((item) => {
      const subtotal = item.price * item.quantity;
      text += `• ${item.name}\n`;
      text += `  ${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(subtotal)}\n`;
    });

    text += `\n━━━━━━━━━━━━━━━━━\n`;
    text += `💰 *TOTAL: ${formatCurrency(total)}*\n\n`;
    text += `✅ ¡Gracias por su compra!\n`;
    text += `🏠 La Pulpería App`;

    return text;
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(generateReceiptText());
    window.open(`https://wa.me/?text=${text}`, '_blank');

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);

    onShare?.({ items, total, receiptNumber });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateReceiptText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const clearReceipt = () => {
    setItems([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl border border-purple-500/20">
          <Receipt className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Generar Recibo</h3>
          <p className="text-xs text-gray-500">Crea y comparte recibos por WhatsApp</p>
        </div>
      </div>

      {/* Formulario para agregar items */}
      <div className="space-y-3 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            placeholder="Producto"
            className="flex-1 px-3 py-2.5 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none text-sm"
          />
          <input
            type="number"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            placeholder="Precio"
            className="w-24 px-3 py-2.5 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none text-sm"
          />
          <Button
            onClick={addItem}
            disabled={!newItem.name.trim() || !newItem.price}
            size="sm"
            className="bg-purple-500 hover:bg-purple-600 px-3"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Preview del recibo */}
      <div
        ref={receiptRef}
        className="bg-[#F4F1EA] rounded-xl p-4 mb-4 text-dark-400"
      >
        {/* Cabecera del recibo */}
        <div className="text-center border-b border-dashed border-gray-400 pb-3 mb-3">
          <p className="text-lg font-bold">{businessName}</p>
          <p className="text-xs text-gray-500">{formatDate()}</p>
          <p className="text-xs text-gray-500">Recibo {receiptNumber}</p>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="text-center py-6">
            <Receipt className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Agrega productos al recibo</p>
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.quantity} x {formatCurrency(item.price)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white rounded-lg border">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 hover:bg-gray-100 rounded-l-lg"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 text-xs font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 hover:bg-gray-100 rounded-r-lg"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="w-20 text-right font-semibold">
                    {formatCurrency(item.price * item.quantity)}
                  </p>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        {items.length > 0 && (
          <div className="border-t border-dashed border-gray-400 pt-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">TOTAL</span>
              <span className="font-bold text-xl text-primary-600">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        )}

        {/* Pie del recibo */}
        {items.length > 0 && (
          <div className="text-center mt-4 pt-3 border-t border-dashed border-gray-400">
            <p className="text-xs text-gray-500">¡Gracias por su compra!</p>
            <p className="text-xs text-gray-400">La Pulpería App</p>
          </div>
        )}
      </div>

      {/* Acciones */}
      {items.length > 0 && (
        <div className="flex gap-2">
          <Button
            onClick={clearReceipt}
            variant="ghost"
            className="flex-1 bg-dark-200 hover:bg-dark-300 text-gray-400"
          >
            <X className="w-4 h-4 mr-2" />
            Limpiar
          </Button>

          <Button
            onClick={copyToClipboard}
            variant="ghost"
            className="bg-dark-200 hover:bg-dark-300 text-gray-300"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>

          <Button
            onClick={shareViaWhatsApp}
            className="flex-1 bg-green-500 hover:bg-green-600"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
        </div>
      )}

      {/* Animación de éxito */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-4 right-4 mx-auto max-w-sm z-50"
          >
            <div className="flex items-center gap-3 px-4 py-3 bg-green-500 rounded-xl shadow-lg">
              <Share2 className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Recibo listo para compartir</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ReceiptGenerator;
