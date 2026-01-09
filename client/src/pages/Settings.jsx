import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Shield, Moon, Globe, Smartphone, Download, Trash2,
  ChevronRight, AlertTriangle, X, Settings as SettingsIcon
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { userApi } from '../services/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, logout } = useAuthStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  // Load settings from localStorage with dark mode based on document class
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('app-settings');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      notifications: true,
      sounds: true,
      vibration: true,
      darkMode: document.documentElement.classList.contains('dark'),
    };
  });

  // Apply dark mode on mount and when changed
  const applyDarkMode = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Apply on mount
  useState(() => {
    applyDarkMode(settings.darkMode);
  }, []);

  const exportMutation = useMutation({
    mutationFn: () => userApi.exportData('json'),
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lapulperia-datos-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      toast.success('Datos exportados');
    },
    onError: () => toast.error('Error al exportar'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => userApi.deleteAccount(),
    onSuccess: () => {
      toast.success('Cuenta eliminada');
      logout();
    },
    onError: () => toast.error('Error al eliminar cuenta'),
  });

  const handleDelete = () => {
    if (deleteConfirm === 'ELIMINAR') {
      deleteMutation.mutate();
    }
  };

  const toggleSetting = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem('app-settings', JSON.stringify(newSettings));

    // Apply dark mode immediately
    if (key === 'darkMode') {
      applyDarkMode(!settings.darkMode);
    }

    toast.success('Configuracion actualizada');
  };

  const SettingToggle = ({ enabled, onChange }) => (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onChange}
      className={`w-12 h-7 rounded-full transition-colors relative ${
        enabled ? 'bg-primary-500' : 'bg-dark-200'
      }`}
    >
      <motion.div
        layout
        className={`w-5 h-5 bg-white rounded-full shadow absolute top-1 ${
          enabled ? 'right-1' : 'left-1'
        }`}
      />
    </motion.button>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
          <SettingsIcon className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Configuracion</h1>
          <p className="text-gray-400 text-sm">Personaliza tu experiencia</p>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden"
      >
        <h2 className="px-5 py-3 bg-dark-200/50 font-medium text-gray-300 text-sm border-b border-white/5">
          Notificaciones
        </h2>
        <div className="divide-y divide-white/5">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">Notificaciones Push</p>
                <p className="text-sm text-gray-500">Recibir alertas de pedidos y ofertas</p>
              </div>
            </div>
            <SettingToggle enabled={settings.notifications} onChange={() => toggleSetting('notifications')} />
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium">Vibracion</p>
                <p className="text-sm text-gray-500">Vibrar al recibir notificaciones</p>
              </div>
            </div>
            <SettingToggle enabled={settings.vibration} onChange={() => toggleSetting('vibration')} />
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium">Sonidos</p>
                <p className="text-sm text-gray-500">Reproducir sonidos de alerta</p>
              </div>
            </div>
            <SettingToggle enabled={settings.sounds} onChange={() => toggleSetting('sounds')} />
          </div>
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden"
      >
        <h2 className="px-5 py-3 bg-dark-200/50 font-medium text-gray-300 text-sm border-b border-white/5">
          Apariencia
        </h2>
        <div className="divide-y divide-white/5">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Moon className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-white font-medium">Modo Oscuro</p>
                <p className="text-sm text-gray-500">Tema oscuro para la aplicacion</p>
              </div>
            </div>
            <SettingToggle enabled={settings.darkMode} onChange={() => toggleSetting('darkMode')} />
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-white font-medium">Idioma</p>
                <p className="text-sm text-gray-500">Espanol (Honduras)</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </div>
        </div>
      </motion.div>

      {/* Data */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden"
      >
        <h2 className="px-5 py-3 bg-dark-200/50 font-medium text-gray-300 text-sm border-b border-white/5">
          Datos
        </h2>
        <div className="divide-y divide-white/5">
          <motion.button
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
            whileTap={{ scale: 0.99 }}
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            className="flex items-center gap-3 w-full px-5 py-4 text-left transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Download className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Exportar mis Datos</p>
              <p className="text-sm text-gray-500">Descargar una copia de tu informacion</p>
            </div>
            {exportMutation.isPending && (
              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ backgroundColor: 'rgba(239,68,68,0.05)' }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-3 w-full px-5 py-4 text-left transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-red-400 font-medium">Eliminar Cuenta</p>
              <p className="text-sm text-gray-500">Borrar permanentemente todos tus datos</p>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Legal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden"
      >
        <h2 className="px-5 py-3 bg-dark-200/50 font-medium text-gray-300 text-sm border-b border-white/5">
          Legal
        </h2>
        <div className="divide-y divide-white/5">
          <motion.button
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
            className="flex items-center justify-between w-full px-5 py-4 transition-colors"
          >
            <span className="text-white font-medium">Terminos de Servicio</span>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </motion.button>
          <motion.button
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
            className="flex items-center justify-between w-full px-5 py-4 transition-colors"
          >
            <span className="text-white font-medium">Politica de Privacidad</span>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </motion.button>
        </div>
      </motion.div>

      {/* Version */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-sm text-gray-500"
      >
        La Pulperia v1.0.0
      </motion.p>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-[100]"
            onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-dark-100 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-6 border border-white/10"
            >
              <div className="flex items-center gap-3 text-red-400 mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">Eliminar Cuenta</h2>
              </div>

              <p className="text-gray-400 mb-4">
                Esta accion eliminara permanentemente tu cuenta y todos tus datos. No podras recuperarlos.
              </p>

              <p className="text-sm text-gray-500 mb-4">
                Escribe <strong className="text-white">ELIMINAR</strong> para confirmar:
              </p>

              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all mb-4"
                placeholder="ELIMINAR"
              />

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 bg-dark-200/50 hover:bg-dark-200 border border-white/5 text-white rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: deleteConfirm === 'ELIMINAR' ? 1.02 : 1 }}
                  whileTap={{ scale: deleteConfirm === 'ELIMINAR' ? 0.98 : 1 }}
                  onClick={handleDelete}
                  disabled={deleteConfirm !== 'ELIMINAR' || deleteMutation.isPending}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                >
                  {deleteMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : (
                    'Eliminar Cuenta'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
