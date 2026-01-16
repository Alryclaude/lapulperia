import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Phone,
  DollarSign,
  Check,
  ChevronRight,
  AlertCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Libro de Clientes - Control de fiado y clientes frecuentes
const CustomerBook = ({
  customers = [],
  onAddCustomer,
  onUpdateBalance,
  onDeleteCustomer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });
  const [paymentAmount, setPaymentAmount] = useState('');

  // Filtrar clientes por búsqueda
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  // Clientes con deuda (fiado)
  const customersWithDebt = customers.filter(c => c.balance > 0);
  const totalDebt = customersWithDebt.reduce((sum, c) => sum + c.balance, 0);

  const handleAddCustomer = () => {
    if (!newCustomer.name.trim()) return;

    onAddCustomer?.({
      id: Date.now(),
      name: newCustomer.name.trim(),
      phone: newCustomer.phone.trim(),
      balance: 0,
      createdAt: new Date(),
    });

    setNewCustomer({ name: '', phone: '' });
    setShowAddForm(false);
  };

  const handlePayment = () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0 || !selectedCustomer) return;

    const newBalance = Math.max(0, selectedCustomer.balance - amount);
    onUpdateBalance?.(selectedCustomer.id, newBalance);

    setPaymentAmount('');
    setSelectedCustomer(null);
  };

  const handleAddDebt = (customerId, amount) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    onUpdateBalance?.(customerId, customer.balance + amount);
  };

  const formatCurrency = (value) => {
    return `L. ${value.toFixed(2)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl border border-blue-500/20">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Libro de Clientes</h3>
            <p className="text-xs text-gray-500">{customers.length} clientes registrados</p>
          </div>
        </div>

        <Button
          onClick={() => setShowAddForm(true)}
          size="sm"
          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30"
          variant="ghost"
        >
          <Plus className="w-4 h-4 mr-1" />
          Agregar
        </Button>
      </div>

      {/* Resumen de fiado */}
      {totalDebt > 0 && (
        <div className="mb-4 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-300">Fiado pendiente</span>
            </div>
            <span className="text-lg font-bold text-amber-400">
              {formatCurrency(totalDebt)}
            </span>
          </div>
          <p className="text-xs text-amber-400/60 mt-1">
            {customersWithDebt.length} {customersWithDebt.length === 1 ? 'cliente' : 'clientes'} con saldo
          </p>
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar cliente..."
          className="w-full pl-10 pr-4 py-2.5 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none text-sm"
        />
      </div>

      {/* Formulario para agregar cliente */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-dark-200/50 rounded-xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">Nuevo cliente</span>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                placeholder="Nombre del cliente"
                className="w-full px-4 py-3 bg-dark-300 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                autoFocus
              />
              <input
                type="tel"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                placeholder="Teléfono (opcional)"
                className="w-full px-4 py-3 bg-dark-300 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
              <Button
                onClick={handleAddCustomer}
                disabled={!newCustomer.name.trim()}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar cliente
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de pago */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedCustomer(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-dark-100 rounded-2xl border border-white/10 p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-white">Registrar pago</h4>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-gray-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center mb-4">
                <p className="text-gray-400">{selectedCustomer.name}</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">
                  Debe: {formatCurrency(selectedCustomer.balance)}
                </p>
              </div>

              <div className="relative mb-4">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Monto a abonar"
                  className="w-full pl-10 pr-4 py-4 bg-dark-200 border border-white/10 rounded-xl text-white text-xl font-bold placeholder-gray-600 focus:border-green-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setPaymentAmount(selectedCustomer.balance.toString());
                  }}
                  variant="ghost"
                  className="flex-1 bg-dark-200 hover:bg-dark-300 text-gray-300"
                >
                  Pagar todo
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Registrar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de clientes */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-10 h-10 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">
              {searchTerm ? 'No se encontraron clientes' : 'Sin clientes registrados'}
            </p>
            {!searchTerm && (
              <p className="text-gray-600 text-xs mt-1">
                Agrega tu primer cliente para llevar control del fiado
              </p>
            )}
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <motion.div
              key={customer.id}
              layout
              className="flex items-center justify-between p-3 bg-dark-200/50 hover:bg-dark-200 rounded-xl transition-colors cursor-pointer group"
              onClick={() => customer.balance > 0 && setSelectedCustomer(customer)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  customer.balance > 0
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{customer.name}</p>
                  {customer.phone && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {customer.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {customer.balance > 0 ? (
                  <div className="text-right">
                    <p className="text-sm font-semibold text-amber-400">
                      {formatCurrency(customer.balance)}
                    </p>
                    <p className="text-xs text-gray-500">Pendiente</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-green-400">
                    <Check className="w-4 h-4" />
                    <span className="text-xs">Al día</span>
                  </div>
                )}
                {customer.balance > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default CustomerBook;
