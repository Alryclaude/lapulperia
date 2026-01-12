import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Save, ToggleLeft, ToggleRight, Palmtree, Copy } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { businessHoursApi } from '@/api';
import toast from 'react-hot-toast';

const DAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miercoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sabado' },
  { key: 'sunday', label: 'Domingo' },
];

const TIME_OPTIONS = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    const hour = h.toString().padStart(2, '0');
    const minute = m.toString().padStart(2, '0');
    TIME_OPTIONS.push(`${hour}:${minute}`);
  }
}

const DEFAULT_HOURS = {
  monday: { open: '08:00', close: '20:00', closed: false },
  tuesday: { open: '08:00', close: '20:00', closed: false },
  wednesday: { open: '08:00', close: '20:00', closed: false },
  thursday: { open: '08:00', close: '20:00', closed: false },
  friday: { open: '08:00', close: '20:00', closed: false },
  saturday: { open: '09:00', close: '18:00', closed: false },
  sunday: { open: '09:00', close: '14:00', closed: true },
};

const BusinessHoursEditor = () => {
  const [hours, setHours] = useState(DEFAULT_HOURS);
  const [vacationMode, setVacationMode] = useState(false);
  const [vacationMessage, setVacationMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const queryClient = useQueryClient();

  // Fetch current business hours
  const { data: currentHours, isLoading } = useQuery({
    queryKey: ['business-hours'],
    queryFn: () => businessHoursApi.getMine().then(res => res.data),
  });

  useEffect(() => {
    if (currentHours) {
      const newHours = { ...DEFAULT_HOURS };
      DAYS.forEach(day => {
        if (currentHours[day.key]) {
          newHours[day.key] = currentHours[day.key];
        }
      });
      setHours(newHours);
      setVacationMode(currentHours.vacationMode || false);
      setVacationMessage(currentHours.vacationMessage || '');
    }
  }, [currentHours]);

  const updateMutation = useMutation({
    mutationFn: (data) => businessHoursApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['business-hours']);
      toast.success('Horarios actualizados');
      setHasChanges(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Error al actualizar horarios');
    },
  });

  const handleDayToggle = (dayKey) => {
    setHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        closed: !prev[dayKey].closed,
      },
    }));
    setHasChanges(true);
  };

  const handleTimeChange = (dayKey, field, value) => {
    setHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateMutation.mutate({
      ...hours,
      vacationMode,
      vacationMessage,
    });
  };

  const copyToAll = (dayKey) => {
    const sourceHours = hours[dayKey];
    const newHours = { ...hours };
    DAYS.forEach(day => {
      if (day.key !== dayKey) {
        newHours[day.key] = { ...sourceHours };
      }
    });
    setHours(newHours);
    setHasChanges(true);
    toast.success(`Horarios copiados a todos los dias`);
  };

  if (isLoading) {
    return (
      <div className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] p-5">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-dark-200 rounded w-1/3"></div>
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="h-12 bg-dark-200 rounded"></div>
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
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Horarios de Apertura
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Configura cuando esta abierta tu pulperia
            </p>
          </div>
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium transition-all disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Guardar
            </button>
          )}
        </div>

        {/* Days list */}
        <div className="space-y-3">
          {DAYS.map((day, index) => (
            <motion.div
              key={day.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                hours[day.key].closed
                  ? 'bg-dark-200/30 border-white/5'
                  : 'bg-dark-200/50 border-white/10'
              }`}
            >
              {/* Day name */}
              <div className="w-24 flex-shrink-0">
                <span className={`font-medium ${hours[day.key].closed ? 'text-gray-500' : 'text-white'}`}>
                  {day.label}
                </span>
              </div>

              {/* Toggle */}
              <button
                onClick={() => handleDayToggle(day.key)}
                className="flex-shrink-0"
              >
                {hours[day.key].closed ? (
                  <ToggleLeft className="w-8 h-8 text-gray-500" />
                ) : (
                  <ToggleRight className="w-8 h-8 text-green-400" />
                )}
              </button>

              {/* Time selectors or closed label */}
              {hours[day.key].closed ? (
                <span className="text-gray-500 text-sm">Cerrado</span>
              ) : (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <select
                    value={hours[day.key].open}
                    onChange={(e) => handleTimeChange(day.key, 'open', e.target.value)}
                    className="px-2 py-1.5 rounded-lg bg-dark-300 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 flex-shrink-0"
                  >
                    {TIME_OPTIONS.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  <span className="text-gray-400 flex-shrink-0">a</span>
                  <select
                    value={hours[day.key].close}
                    onChange={(e) => handleTimeChange(day.key, 'close', e.target.value)}
                    className="px-2 py-1.5 rounded-lg bg-dark-300 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 flex-shrink-0"
                  >
                    {TIME_OPTIONS.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>

                  {/* Copy to all button - icon on mobile, text on desktop */}
                  <button
                    onClick={() => copyToAll(day.key)}
                    className="ml-auto flex-shrink-0 p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
                    title="Copiar a todos los dias"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Vacation mode */}
        <div className="mt-6 p-4 rounded-xl bg-dark-200/50 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Palmtree className="w-5 h-5 text-green-400" />
              <span className="font-medium text-white">Modo Vacaciones</span>
            </div>
            <button
              onClick={() => {
                setVacationMode(!vacationMode);
                setHasChanges(true);
              }}
            >
              {vacationMode ? (
                <ToggleRight className="w-8 h-8 text-green-400" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-500" />
              )}
            </button>
          </div>

          {vacationMode && (
            <div className="space-y-3">
              <p className="text-sm text-gray-400">
                Tu pulperia se mostrara como cerrada temporalmente
              </p>
              <textarea
                value={vacationMessage}
                onChange={(e) => {
                  setVacationMessage(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="Mensaje para tus clientes (ej: Estaremos de vacaciones hasta el 15 de enero)"
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-dark-300 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BusinessHoursEditor;
