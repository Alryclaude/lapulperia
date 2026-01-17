import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Loader2, AlertTriangle } from 'lucide-react';
import { requestNotificationPermission } from '../services/firebase';
import { userApi } from '../api/auth';
import toast from 'react-hot-toast';

const NotificationPrompt = ({ variant = 'banner' }) => {
  const [permission, setPermission] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

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
    setError(null);

    try {
      // Verificar si las notificaciones están soportadas
      if (!('Notification' in window)) {
        setError('Tu navegador no soporta notificaciones');
        toast.error('Tu navegador no soporta notificaciones');
        return;
      }

      // Verificar si el service worker está disponible
      if (!('serviceWorker' in navigator)) {
        setError('Service Worker no disponible');
        toast.error('Service Worker no disponible en este navegador');
        return;
      }

      // Registrar service worker si no está activo
      const registration = await navigator.serviceWorker.ready;
      console.log('[NotificationPrompt] Service Worker ready:', registration);

      const token = await requestNotificationPermission();

      if (token) {
        console.log('[NotificationPrompt] FCM Token obtenido:', token.substring(0, 20) + '...');

        // Guardar token en el servidor
        try {
          await userApi.updateFCMToken(token);
          console.log('[NotificationPrompt] Token registrado en servidor');
        } catch (apiError) {
          console.error('[NotificationPrompt] Error al guardar token:', apiError);
          // Aun si falla el servidor, las notificaciones locales pueden funcionar
        }

        setPermission('granted');
        setIsSuccess(true);
        toast.success('Notificaciones activadas');
        setTimeout(() => setIsDismissed(true), 2000);
      } else {
        const currentPermission = Notification.permission;
        setPermission(currentPermission);

        if (currentPermission === 'denied') {
          setError('Permiso denegado. Habilita notificaciones en la configuracion de tu navegador.');
          toast.error('Notificaciones bloqueadas. Revisa la configuracion del navegador.');
        } else {
          setError('No se pudo obtener el token de notificaciones');
          toast.error('Error al activar notificaciones. Intenta de nuevo.');
        }
      }
    } catch (error) {
      console.error('[NotificationPrompt] Error:', error);
      setError('Error al activar notificaciones');
      toast.error('Error al activar notificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('notif-prompt-dismissed', 'true');
    setIsDismissed(true);
  };

  // No mostrar si ya tiene permisos o fue descartado
  if (permission === 'granted' || isDismissed) {
    return null;
  }

  // Si fue denegado, mostrar mensaje de ayuda
  if (permission === 'denied') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-200">
            Notificaciones bloqueadas. Para activarlas, haz click en el icono de candado junto a la URL.
          </p>
          <button
            onClick={handleDismiss}
            className="text-amber-400 hover:text-amber-300 text-xs underline flex-shrink-0"
          >
            Entendido
          </button>
        </div>
      </motion.div>
    );
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
