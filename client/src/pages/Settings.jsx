import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Bell, Shield, Moon, Globe, Smartphone, Download, Trash2,
  ChevronRight, AlertTriangle, X
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { userApi } from '../services/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, logout } = useAuthStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [settings, setSettings] = useState({
    notifications: true,
    sounds: true,
    vibration: true,
    darkMode: false,
  });

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
    setSettings({ ...settings, [key]: !settings[key] });
    toast.success('Configuracion actualizada');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Configuracion</h1>

      {/* Notifications */}
      <div className="card overflow-hidden">
        <h2 className="px-5 py-3 bg-gray-50 font-medium text-gray-700 text-sm">
          Notificaciones
        </h2>
        <div className="divide-y">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-gray-900">Notificaciones Push</p>
                <p className="text-sm text-gray-500">Recibir alertas de pedidos y ofertas</p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('notifications')}
              className={`w-12 h-7 rounded-full transition-colors ${
                settings.notifications ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings.notifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-gray-900">Vibracion</p>
                <p className="text-sm text-gray-500">Vibrar al recibir notificaciones</p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('vibration')}
              className={`w-12 h-7 rounded-full transition-colors ${
                settings.vibration ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings.vibration ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-gray-900">Sonidos</p>
                <p className="text-sm text-gray-500">Reproducir sonidos de alerta</p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('sounds')}
              className={`w-12 h-7 rounded-full transition-colors ${
                settings.sounds ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings.sounds ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="card overflow-hidden">
        <h2 className="px-5 py-3 bg-gray-50 font-medium text-gray-700 text-sm">
          Apariencia
        </h2>
        <div className="divide-y">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-gray-900">Modo Oscuro</p>
                <p className="text-sm text-gray-500">Tema oscuro para la aplicacion</p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('darkMode')}
              className={`w-12 h-7 rounded-full transition-colors ${
                settings.darkMode ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings.darkMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-gray-900">Idioma</p>
                <p className="text-sm text-gray-500">Español (Honduras)</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Data */}
      <div className="card overflow-hidden">
        <h2 className="px-5 py-3 bg-gray-50 font-medium text-gray-700 text-sm">
          Datos
        </h2>
        <div className="divide-y">
          <button
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            className="flex items-center gap-3 w-full px-5 py-4 hover:bg-gray-50 text-left"
          >
            <Download className="w-5 h-5 text-gray-500" />
            <div className="flex-1">
              <p className="text-gray-900">Exportar mis Datos</p>
              <p className="text-sm text-gray-500">Descargar una copia de tu informacion</p>
            </div>
            {exportMutation.isPending && (
              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            )}
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-3 w-full px-5 py-4 hover:bg-red-50 text-left"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
            <div className="flex-1">
              <p className="text-red-600">Eliminar Cuenta</p>
              <p className="text-sm text-gray-500">Borrar permanentemente todos tus datos</p>
            </div>
          </button>
        </div>
      </div>

      {/* Legal */}
      <div className="card overflow-hidden">
        <h2 className="px-5 py-3 bg-gray-50 font-medium text-gray-700 text-sm">
          Legal
        </h2>
        <div className="divide-y">
          <button className="flex items-center justify-between w-full px-5 py-4 hover:bg-gray-50">
            <span className="text-gray-900">Terminos de Servicio</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button className="flex items-center justify-between w-full px-5 py-4 hover:bg-gray-50">
            <span className="text-gray-900">Politica de Privacidad</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Version */}
      <p className="text-center text-sm text-gray-400">
        La Pulperia v1.0.0
      </p>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h2 className="text-xl font-bold">Eliminar Cuenta</h2>
            </div>

            <p className="text-gray-600 mb-4">
              Esta accion eliminara permanentemente tu cuenta y todos tus datos. No podras recuperarlos.
            </p>

            <p className="text-sm text-gray-500 mb-4">
              Escribe <strong>ELIMINAR</strong> para confirmar:
            </p>

            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="input mb-4"
              placeholder="ELIMINAR"
            />

            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== 'ELIMINAR' || deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar Cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
