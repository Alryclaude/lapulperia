import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  User, Package, Heart, Briefcase, Wrench, Settings, LogOut,
  ChevronRight, Star, MapPin, Bell, Shield, HelpCircle
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
        { icon: Star, label: 'Mis Reseñas', to: '/reviews' },
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
      {/* Profile Header */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-20 h-20 rounded-2xl object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center">
              <User className="w-10 h-10 text-primary-600" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{user?.name}</h1>
            <p className="text-gray-500">{user?.email}</p>
            {user?.role === 'PULPERIA' && (
              <Link to="/dashboard" className="text-primary-600 font-medium text-sm hover:underline">
                Ir a mi Pulperia →
              </Link>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.orders || 0}</p>
            <p className="text-sm text-gray-500">Pedidos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.reviews || 0}</p>
            <p className="text-sm text-gray-500">Reseñas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.favorites || 0}</p>
            <p className="text-sm text-gray-500">Favoritos</p>
          </div>
        </div>
      </div>

      {/* Achievements */}
      {stats.achievements?.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Mis Logros</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {stats.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex-shrink-0 w-20 text-center"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl shadow-lg">
                  {achievement.icon}
                </div>
                <p className="text-xs text-gray-600 mt-2 line-clamp-2">{achievement.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menu */}
      {menuItems.map((section) => (
        <div key={section.title} className="card overflow-hidden">
          <h2 className="px-5 py-3 bg-gray-50 font-medium text-gray-700 text-sm">
            {section.title}
          </h2>
          <div className="divide-y">
            {section.items.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <item.icon className="w-5 h-5 text-gray-500" />
                <span className="flex-1 text-gray-900">{item.label}</span>
                {item.badge > 0 && (
                  <span className="badge-accent">{item.badge}</span>
                )}
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="card w-full p-4 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Cerrar Sesion
      </button>

      {/* Version */}
      <p className="text-center text-sm text-gray-400">
        La Pulperia v1.0.0
      </p>
    </div>
  );
};

export default Profile;
