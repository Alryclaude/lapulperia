import { useState } from 'react';
import { Bell, Package, Star, Briefcase, Store } from 'lucide-react';
import toast from 'react-hot-toast';

const NotificationSettings = () => {
  // Configuración local (en producción, esto vendría del backend)
  const [settings, setSettings] = useState({
    orderUpdates: true,
    promotions: false,
    newProducts: true,
    jobAlerts: false,
    pulperiaUpdates: true,
  });

  const handleToggle = (key) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: !prev[key] };
      // En producción, aquí se guardaría en el backend
      toast.success('Preferencia actualizada');
      return newSettings;
    });
  };

  const notificationOptions = [
    {
      key: 'orderUpdates',
      icon: Package,
      title: 'Actualizaciones de pedidos',
      description: 'Recibe notificaciones cuando tu pedido cambie de estado',
    },
    {
      key: 'promotions',
      icon: Star,
      title: 'Promociones y ofertas',
      description: 'Entérate de descuentos y ofertas especiales',
    },
    {
      key: 'newProducts',
      icon: Store,
      title: 'Nuevos productos',
      description: 'Notificaciones cuando tus pulperías favoritas agreguen productos',
    },
    {
      key: 'jobAlerts',
      icon: Briefcase,
      title: 'Alertas de empleo',
      description: 'Recibe alertas de nuevas ofertas de trabajo',
    },
    {
      key: 'pulperiaUpdates',
      icon: Bell,
      title: 'Horarios de pulperías',
      description: 'Notificaciones cuando tus favoritos abran o cierren',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
        <p className="text-gray-500 mt-1">Configura qué notificaciones quieres recibir</p>
      </div>

      <div className="card divide-y divide-gray-100">
        {notificationOptions.map((option) => {
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

      <p className="text-sm text-gray-500 text-center">
        Las notificaciones se envían a través de la app y correo electrónico.
      </p>
    </div>
  );
};

export default NotificationSettings;
