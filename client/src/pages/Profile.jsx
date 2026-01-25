import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  User, Package, Heart, Briefcase, Wrench, Settings, LogOut,
  ChevronRight, Star, Bell, Shield, HelpCircle
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { userApi } from '../services/api';

const Profile = () => {
  const { user, logout } = useAuthStore();

  const { data } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => userApi.getStats(),
  });

  const userData = data?.data?.user || {};
  const stats = {
    orders: userData._count?.orders || 0,
    reviews: userData._count?.reviews || 0,
    favorites: userData._count?.favorites || 0,
    pendingOrders: 0,
    achievements: userData.pulperia?.achievements || [],
  };

  const menuItems = [
    {
      title: 'Mi Cuenta',
      items: [
        { icon: Package, label: 'Mis Pedidos', to: '/orders', badge: stats.pendingOrders },
        { icon: Heart, label: 'Favoritos', to: '/favorites', badge: stats.favorites },
        { icon: Star, label: 'Mis Resenas', to: '/reviews' },
      ],
    },
    {
      title: 'Oportunidades',
      items: [
        { icon: Briefcase, label: 'Mis Aplicaciones', to: '/applications' },
        { icon: Wrench, label: 'Mis Servicios', to: '/profile/services' },
      ],
    },
    {
      title: 'Configuracion',
      items: [
        { icon: Bell, label: 'Notificaciones', to: '/settings/notifications' },
        { icon: Shield, label: 'Privacidad', to: '/settings/privacy' },
        { icon: Settings, label: 'Configuracion', to: '/settings' },
        { icon: HelpCircle, label: 'Ayuda', to: '/help' },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header - Colores "Vibrancia de Barrio" */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-1 backdrop-blur-sm rounded-2xl border border-white/5 p-6"
      >
        <div className="flex items-center gap-4">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500/30" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-amber-500/20 flex items-center justify-center border border-amber-500/30">
              <User className="w-10 h-10 text-amber-400" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{user?.name}</h1>
            <p className="text-gray-400">{user?.email}</p>
            {user?.role === 'PULPERIA' && (
              <Link to="/dashboard" className="text-primary-400 font-medium text-sm hover:text-primary-300 transition-colors">
                Ir a mi Pulperia →
              </Link>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{stats.orders || 0}</p>
            <p className="text-sm text-gray-400">Pedidos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{stats.reviews || 0}</p>
            <p className="text-sm text-gray-400">Resenas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{stats.favorites || 0}</p>
            <p className="text-sm text-gray-400">Favoritos</p>
          </div>
        </div>
      </motion.div>

      {/* Achievements */}
      {stats.achievements?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5"
        >
          <h2 className="font-semibold text-white mb-4">Mis Logros</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {stats.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex-shrink-0 w-20 text-center"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl shadow-lg">
                  {achievement.icon}
                </div>
                <p className="text-xs text-gray-400 mt-2 line-clamp-2">{achievement.name}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Menu */}
      {menuItems.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + sectionIndex * 0.05 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden"
        >
          <h2 className="px-5 py-3 bg-dark-200/50 font-medium text-gray-300 text-sm border-b border-white/5">
            {section.title}
          </h2>
          <div className="divide-y divide-white/5">
            {section.items.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-dark-200/80 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                  <item.icon className="w-5 h-5 text-gray-400 group-hover:text-primary-400 transition-colors" />
                </div>
                <span className="flex-1 text-white">{item.label}</span>
                {item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400 text-xs font-medium">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-gray-300 transition-colors" />
              </Link>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Logout */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleLogout}
        className="w-full bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-4 flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
      >
        <LogOut className="w-5 h-5" />
        Cerrar Sesion
      </motion.button>

      {/* Version */}
      <p className="text-center text-sm text-gray-500">
        La Pulperia v1.0.0
      </p>
    </div>
  );
};

export default Profile;
