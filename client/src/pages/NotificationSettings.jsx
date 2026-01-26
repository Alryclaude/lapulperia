import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Package, Star, Briefcase, Store, AlertCircle } from 'lucide-react';
import { requestPermission, initializeMessaging } from '../services/notifications';
import toast from 'react-hot-toast';

const NotificationSettings = () => {
  const [permissionStatus, setPermissionStatus] = useState('default');

  // Check permission status on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // Configuracion local (en produccion, esto vendria del backend)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('notification-preferences');
    if (saved) return JSON.parse(saved);
    return {
      orderUpdates: true,
      promotions: false,
      newProducts: true,
      jobAlerts: false,
      pulperiaUpdates: true,
    };
  });

  const handleEnableNotifications = async () => {
    try {
      await initializeMessaging();
      const permission = await requestPermission();
      setPermissionStatus(permission);
      if (permission === 'granted') {
        toast.success('Notificaciones activadas');
      } else {
        toast.error('Permiso denegado');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al activar notificaciones');
    }
  };

  const handleToggle = (key) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: !prev[key] };
      localStorage.setItem('notification-preferences', JSON.stringify(newSettings));
      toast.success('Preferencia actualizada');
      return newSettings;
    });
  };

  const notificationOptions = [
    {
      key: 'orderUpdates',
      icon: Package,
      color: 'bg-blue-500/20 text-blue-400',
      title: 'Actualizaciones de pedidos',
      description: 'Recibe notificaciones cuando tu pedido cambie de estado',
    },
    {
      key: 'promotions',
      icon: Star,
      color: 'bg-yellow-500/20 text-yellow-400',
      title: 'Promociones y ofertas',
      description: 'Enterate de descuentos y ofertas especiales',
    },
    {
      key: 'newProducts',
      icon: Store,
      color: 'bg-green-500/20 text-green-400',
      title: 'Nuevos productos',
      description: 'Notificaciones cuando tus pulperias favoritas agreguen productos',
    },
    {
      key: 'jobAlerts',
      icon: Briefcase,
      color: 'bg-purple-500/20 text-purple-400',
      title: 'Alertas de empleo',
      description: 'Recibe alertas de nuevas ofertas de trabajo',
    },
    {
      key: 'pulperiaUpdates',
      icon: Bell,
      color: 'bg-primary-500/20 text-primary-400',
      title: 'Horarios de pulperias',
      description: 'Notificaciones cuando tus favoritos abran o cierren',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
          <Bell className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Notificaciones</h1>
          <p className="text-gray-400 text-sm">Configura que notificaciones quieres recibir</p>
        </div>
      </motion.div>

      {/* Permission Banner */}
      {permissionStatus !== 'granted' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-amber-200 font-medium">Notificaciones desactivadas</p>
              <p className="text-amber-200/70 text-sm mt-1">
                Activa las notificaciones para recibir alertas de pedidos y mas.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEnableNotifications}
                className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Activar Notificaciones
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden"
      >
        <h2 className="px-5 py-3 bg-dark-200/50 font-medium text-gray-300 text-sm border-b border-white/5">
          Preferencias
        </h2>
        <div className="divide-y divide-white/5">
          {notificationOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <motion.div
                key={option.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg ${option.color.split(' ')[0]} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${option.color.split(' ')[1]}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{option.title}</h3>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleToggle(option.key)}
                  disabled={permissionStatus !== 'granted'}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    settings[option.key] && permissionStatus === 'granted'
                      ? 'bg-primary-500'
                      : 'bg-dark-200'
                  } ${permissionStatus !== 'granted' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <motion.span
                    layout
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow ${
                      settings[option.key] && permissionStatus === 'granted'
                        ? 'right-1'
                        : 'left-1'
                    }`}
                  />
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-gray-500 text-center"
      >
        Las notificaciones se envian a traves de la app.
      </motion.p>
    </div>
  );
};

export default NotificationSettings;
