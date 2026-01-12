import { motion } from 'framer-motion';
import { Tag, Plus, Calendar, TrendingUp, Pause, Play, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promotionsApi } from '@/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const PromotionsPanel = ({ onCreateClick }) => {
  const queryClient = useQueryClient();

  const { data: promotions = [], isLoading } = useQuery({
    queryKey: ['my-promotions'],
    queryFn: () => promotionsApi.getMyPromotions({ status: 'active' }).then(res => res.data),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => promotionsApi.update(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-promotions']);
      toast.success('Promocion actualizada');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => promotionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-promotions']);
      toast.success('Promocion eliminada');
    },
  });

  const getTypeLabel = (type) => {
    switch (type) {
      case 'PERCENTAGE': return 'Porcentaje';
      case 'FIXED_AMOUNT': return 'Monto fijo';
      case 'BUY_X_GET_Y': return 'Compra X, Lleva Y';
      case 'COMBO': return 'Combo';
      default: return type;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-HN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const days = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  if (isLoading) {
    return (
      <div className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] p-5">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-dark-200 rounded w-1/3"></div>
          {[1, 2].map(i => (
            <div key={i} className="h-24 bg-dark-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] p-5 relative overflow-hidden"
    >
      {/* Gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-transparent" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-pink-400" />
              Promociones Activas
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {promotions.length} promociones activas
            </p>
          </div>
          <button
            onClick={onCreateClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva
          </button>
        </div>

        {/* Promotions list */}
        <div className="space-y-3 max-h-[350px] overflow-y-auto">
          {promotions.length > 0 ? (
            promotions.map((promo) => {
              const daysRemaining = getDaysRemaining(promo.endDate);

              return (
                <div
                  key={promo.id}
                  className="p-4 rounded-xl bg-dark-200/50 border border-white/5 hover:border-white/10 transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-white">{promo.name}</h4>
                      <span className="text-xs text-gray-500">{getTypeLabel(promo.type)}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      promo.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {promo.isActive ? 'Activa' : 'Pausada'}
                    </span>
                  </div>

                  {/* Description */}
                  {promo.description && (
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{promo.description}</p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm mb-3">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {formatDate(promo.startDate)}
                      {promo.endDate && ` - ${formatDate(promo.endDate)}`}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <TrendingUp className="w-4 h-4" />
                      {promo.usageCount} usos
                    </div>
                  </div>

                  {/* Days remaining */}
                  {daysRemaining !== null && daysRemaining <= 7 && (
                    <div className={`text-xs mb-3 ${
                      daysRemaining <= 2 ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {daysRemaining === 0 ? 'Termina hoy' : `${daysRemaining} dias restantes`}
                    </div>
                  )}

                  {/* Progress bar if max usage */}
                  {promo.maxUsage && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Uso</span>
                        <span>{promo.usageCount}/{promo.maxUsage}</span>
                      </div>
                      <div className="h-1.5 bg-dark-300 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 to-primary-500 rounded-full"
                          style={{ width: `${Math.min(100, (promo.usageCount / promo.maxUsage) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleMutation.mutate({ id: promo.id, isActive: !promo.isActive })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        promo.isActive
                          ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400'
                          : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                      }`}
                    >
                      {promo.isActive ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          Activar
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Estas seguro de eliminar esta promocion?')) {
                          deleteMutation.mutate(promo.id);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <Tag className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No tienes promociones activas</p>
              <button
                onClick={onCreateClick}
                className="mt-3 inline-flex items-center gap-1.5 text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Crear tu primera promocion
              </button>
            </div>
          )}
        </div>

        {/* View all link */}
        {promotions.length > 0 && (
          <Link
            to="/manage/promotions"
            className="block text-center text-sm text-primary-400 hover:text-primary-300 mt-4 transition-colors"
          >
            Ver todas las promociones →
          </Link>
        )}
      </div>
    </motion.div>
  );
};

export default PromotionsPanel;
