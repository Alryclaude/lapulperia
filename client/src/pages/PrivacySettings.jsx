import { useState } from 'react';
import { Shield, Eye, MapPin, Users, Download } from 'lucide-react';
import { userApi } from '../services/api';
import toast from 'react-hot-toast';

const PrivacySettings = () => {
  const [settings, setSettings] = useState({
    showProfile: true,
    shareLocation: true,
    showActivity: false,
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleToggle = (key) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: !prev[key] };
      toast.success('Preferencia actualizada');
      return newSettings;
    });
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const response = await userApi.exportData();
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lapulperia-datos-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Datos exportados');
    } catch (error) {
      toast.error('Error al exportar datos');
    } finally {
      setIsExporting(false);
    }
  };

  const privacyOptions = [
    {
      key: 'showProfile',
      icon: Eye,
      title: 'Perfil visible',
      description: 'Permite que otros usuarios vean tu perfil público',
    },
    {
      key: 'shareLocation',
      icon: MapPin,
      title: 'Compartir ubicación',
      description: 'Usa tu ubicación para mostrarte pulperías cercanas',
    },
    {
      key: 'showActivity',
      icon: Users,
      title: 'Actividad visible',
      description: 'Muestra tus reseñas y actividad a otros usuarios',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Privacidad</h1>
        <p className="text-gray-500 mt-1">Controla cómo se usa tu información</p>
      </div>

      <div className="card divide-y divide-gray-100">
        {privacyOptions.map((option) => {
          const Icon = option.icon;
          return (
            <div key={option.key} className="p-4 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{option.title}</h3>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle(option.key)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings[option.key] ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings[option.key] ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      {/* Exportar datos */}
      <div className="card p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Download className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">Exportar mis datos</h3>
            <p className="text-sm text-gray-500 mb-3">
              Descarga una copia de toda tu información almacenada
            </p>
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="btn-secondary text-sm"
            >
              {isExporting ? 'Exportando...' : 'Descargar datos'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 p-4 bg-gray-50 rounded-xl">
        <Shield className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-600">
          Tu privacidad es importante. Nunca compartimos tu información personal con terceros
          sin tu consentimiento.
        </p>
      </div>
    </div>
  );
};

export default PrivacySettings;
