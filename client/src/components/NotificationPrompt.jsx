import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Loader2 } from 'lucide-react';
import { requestNotificationPermission } from '../services/firebase';
import { userApi } from '../api/auth';

const NotificationPrompt = ({ variant = 'banner' }) => {
  const [permission, setPermission] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Verificar permiso actual
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Verificar si ya fue descartado en esta sesión
    const dismissed = sessionStorage.getItem('notif-prompt-dismissed');
    if (dismissed) setIsDismissed(true);
  }, []);

  const handleEnable = async () => {
    setIsLoading(true);
    try {
      const token = await requestNotificationPermission();
      if (token) {
        // Guardar token en el servidor
        await userApi.updateFCMToken(token);
        setPermission('granted');
        setIsSuccess(true);
        setTimeout(() => setIsDismissed(true), 2000);
      } else {
        setPermission(Notification.permission);
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('notif-prompt-dismissed', 'true');
    setIsDismissed(true);
  };

  // No mostrar si ya tiene permisos o fue descartado
  if (permission === 'granted' || permission === 'denied' || isDismissed) {
    return null;
  }

  // Variante compacta para usar en listas
  if (variant === 'compact') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gradient-to-r from-primary-500/10 to-amber-500/10 border border-primary-500/20 rounded-xl p-3 mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4 text-primary-400" />
            </div>
            <p className="text-sm text-gray-300 flex-1">
              Activa notificaciones para saber cuando tu pedido esté listo
            </p>
            <button
              onClick={handleEnable}
              disabled={isLoading}
              className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Activar'
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Variante banner (default)
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-gradient-to-r from-primary-500/20 via-purple-500/10 to-amber-500/20 border border-primary-500/30 rounded-2xl p-4 mb-6 relative overflow-hidden"
      >
        {/* Efecto de brillo */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />

        <div className="relative flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0 border border-primary-500/30">
            {isSuccess ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-green-400"
              >
                <Check className="w-6 h-6" />
              </motion.div>
            ) : (
              <Bell className="w-6 h-6 text-primary-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white mb-1">
              {isSuccess ? '¡Notificaciones activadas!' : 'No te pierdas nada'}
            </h3>
            <p className="text-sm text-gray-400">
              {isSuccess
                ? 'Te avisaremos cuando tu pedido esté listo'
                : 'Activa las notificaciones para saber cuando tu pedido esté listo para recoger'}
            </p>

            {!isSuccess && (
              <div className="flex gap-2 mt-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEnable}
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Activando...
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      Activar notificaciones
                    </>
                  )}
                </motion.button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 text-gray-400 hover:text-gray-300 text-sm transition-colors"
                >
                  Ahora no
                </button>
              </div>
            )}
          </div>

          {!isSuccess && (
            <button
              onClick={handleDismiss}
              className="text-gray-500 hover:text-gray-400 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationPrompt;
