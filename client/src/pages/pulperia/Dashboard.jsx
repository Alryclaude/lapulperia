import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { statsApi, pulperiaApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { socketService } from '../../services/socket';
import { playNotificationSound } from '../../services/notifications';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  Package,
  Tag,
  Clock,
  MapPin,
  ShoppingBag,
} from 'lucide-react';
import {
  StatusToggle,
  StatsCards,
  AchievementsBadges,
  QuickActions,
  ExportSection,
  SalesChart,
  TopProductsChart,
  PeakHoursChart,
  InventoryPanel,
  StockUpdateModal,
  BusinessHoursEditor,
  PromotionsPanel,
} from '../../components/dashboard';

const TABS = [
  { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
  { id: 'inventario', label: 'Inventario', icon: Package },
  { id: 'promociones', label: 'Promociones', icon: Tag },
  { id: 'horarios', label: 'Horarios', icon: Clock },
];

const Dashboard = () => {
  const { user, refreshUser } = useAuthStore();
  const queryClient = useQueryClient();
  const pulperia = user?.pulperia;

  const [activeTab, setActiveTab] = useState('resumen');
  const [isOpen, setIsOpen] = useState(pulperia?.status === 'OPEN');
  const [stockModalProduct, setStockModalProduct] = useState(null);

  // Sync isOpen state when pulperia data changes
  useEffect(() => {
    if (pulperia?.status) {
      setIsOpen(pulperia.status === 'OPEN');
    }
  }, [pulperia?.status]);

  // Socket Listener para Nuevas Órdenes en Tiempo Real
  useEffect(() => {
    if (!pulperia?.id) return;

    // Conectar socket
    socketService.connect(user?.id);

    // Escuchar nuevas órdenes
    const unsubNewOrder = socketService.subscribe('new-order', (data) => {
      // Reproducir sonido (usa fallback a Web Audio API si no hay archivo)
      playNotificationSound('order');

      // Toast de nueva orden
      toast.custom((t) => (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="bg-dark-200/90 backdrop-blur-md border-l-4 border-primary-500 rounded-r-lg p-4 shadow-lg shadow-primary-500/20 flex items-center gap-4 min-w-[300px]"
        >
          <div className="bg-primary-500/20 p-2 rounded-full animate-pulse">
            <ShoppingBag className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h4 className="font-bold text-white tracking-wide">¡Nueva Orden!</h4>
            <p className="text-primary-300 font-mono text-sm">
              #{data.order?.orderNumber?.slice(-6) || '----'} • L. {data.order?.total?.toFixed(2) || '0.00'}
            </p>
          </div>
        </motion.div>
      ), { duration: 6000, position: 'top-right' });

      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    });

    // Escuchar cambios de estado de órdenes
    const unsubOrderUpdate = socketService.subscribe('order-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    });

    return () => {
      unsubNewOrder();
      unsubOrderUpdate();
    };
  }, [pulperia?.id, user?.id, queryClient]);

  // Fetch stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => statsApi.getDashboard(),
    refetchInterval: 30000,
  });

  const stats = statsData?.data || {};

  // Toggle open/closed status
  const handleToggleStatus = async () => {
    try {
      const newStatus = isOpen ? 'CLOSED' : 'OPEN';
      await pulperiaApi.updateStatus({ status: newStatus });
      setIsOpen(!isOpen);
      await refreshUser();
      toast.success(isOpen ? 'Pulpería cerrada' : '¡Pulpería abierta!');
    } catch {
      toast.error('Error al cambiar estado');
    }
  };

  // Export data
  const handleExport = async (format) => {
    try {
      const response = await statsApi.export({ format });
      const isCSV = format === 'csv';
      const blob = new Blob(
        [isCSV ? response.data : JSON.stringify(response.data, null, 2)],
        { type: isCSV ? 'text/csv' : 'application/json' }
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = isCSV ? 'ventas.csv' : 'datos.json';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Datos exportados');
    } catch {
      toast.error('Error al exportar');
    }
  };

  // Handle create promotion click
  const handleCreatePromotion = () => {
    // Navigate to promotions management page
    window.location.href = '/manage/promotions?create=true';
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{pulperia?.name || 'Mi Pulpería'}</h1>
          <div className="flex items-center gap-2 mt-1 text-gray-400 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{pulperia?.address || 'Sin ubicación'}</span>
          </div>
        </div>
        <StatusToggle isOpen={isOpen} onToggle={handleToggleStatus} />
      </div>

      {/* Stats Cards - Always visible */}
      <StatsCards stats={stats} pulperia={pulperia} />

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'bg-dark-100/50 text-gray-400 border border-white/5 hover:bg-dark-100 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* RESUMEN TAB */}
          {activeTab === 'resumen' && (
            <div className="space-y-6">
              {/* Charts Row */}
              <div className="grid lg:grid-cols-2 gap-6">
                <SalesChart dailyRevenue={stats.dailyRevenue} />
                <TopProductsChart products={stats.topProducts} />
              </div>

              {/* Peak Hours */}
              <PeakHoursChart peakHours={stats.peakHours} />

              {/* Achievements */}
              <AchievementsBadges achievements={stats.achievements} />

              {/* Quick Actions */}
              <QuickActions />

              {/* Export */}
              <ExportSection onExport={handleExport} />
            </div>
          )}

          {/* INVENTARIO TAB */}
          {activeTab === 'inventario' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] p-5 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {stats.lowStockProducts?.length > 0
                      ? (pulperia?.productCount || 0) - stats.lowStockProducts.length
                      : pulperia?.productCount || 0}
                  </p>
                  <p className="text-sm text-gray-400">En Stock</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] p-5 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6 text-yellow-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {stats.lowStockProducts?.filter(p => !p.outOfStock && p.stockQuantity > 0).length || 0}
                  </p>
                  <p className="text-sm text-gray-400">Stock Bajo</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] p-5 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6 text-red-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {stats.lowStockProducts?.filter(p => p.outOfStock || p.stockQuantity === 0).length || 0}
                  </p>
                  <p className="text-sm text-gray-400">Agotados</p>
                </motion.div>
              </div>

              {/* Inventory Panel */}
              <InventoryPanel
                lowStockProducts={stats.lowStockProducts || []}
                onRestockClick={(product) => setStockModalProduct(product)}
              />

              {/* Slow Moving Products */}
              {stats.slowMovingProducts?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] p-5"
                >
                  <h3 className="font-semibold text-white mb-4">Productos Sin Movimiento</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Estos productos no se han vendido en las últimas 2 semanas
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {stats.slowMovingProducts.slice(0, 8).map((product) => (
                      <div
                        key={product.id}
                        className="p-3 rounded-xl bg-dark-200/50 border border-white/5"
                      >
                        <div className="w-full aspect-square rounded-lg bg-dark-300 overflow-hidden mb-2">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-medium text-white truncate">{product.name}</p>
                        <p className="text-xs text-gray-400">L. {product.price?.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* PROMOCIONES TAB */}
          {activeTab === 'promociones' && (
            <div className="space-y-6">
              <PromotionsPanel onCreateClick={handleCreatePromotion} />
            </div>
          )}

          {/* HORARIOS TAB */}
          {activeTab === 'horarios' && (
            <div className="space-y-6">
              <BusinessHoursEditor />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Stock Update Modal */}
      <StockUpdateModal
        isOpen={!!stockModalProduct}
        onClose={() => setStockModalProduct(null)}
        product={stockModalProduct}
      />
    </div>
  );
};

export default Dashboard;
