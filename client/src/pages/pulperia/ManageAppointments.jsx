import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Calendar, Clock, X, Check, User, Phone, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, PlayCircle, AlertCircle
} from 'lucide-react';
import { appointmentsApi } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  SCHEDULED: { label: 'Programada', color: 'blue', icon: Calendar },
  CONFIRMED: { label: 'Confirmada', color: 'cyan', icon: CheckCircle },
  IN_PROGRESS: { label: 'En curso', color: 'amber', icon: PlayCircle },
  COMPLETED: { label: 'Completada', color: 'green', icon: CheckCircle },
  CANCELLED: { label: 'Cancelada', color: 'red', icon: XCircle },
  NO_SHOW: { label: 'No asistió', color: 'gray', icon: AlertCircle }
};

const ManageAppointments = () => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    serviceName: '',
    date: '',
    timeSlot: '',
    duration: 60,
    agreedPrice: '',
    notes: ''
  });

  const dateStr = selectedDate.toISOString().split('T')[0];

  const { data, isLoading } = useQuery({
    queryKey: ['appointments', dateStr],
    queryFn: () => appointmentsApi.list({ date: dateStr }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['appointment-stats'],
    queryFn: () => appointmentsApi.getStats(),
  });

  const appointments = data?.data || [];
  const stats = statsData?.data || {};

  const createMutation = useMutation({
    mutationFn: (data) => appointmentsApi.create(data),
    onSuccess: () => {
      toast.success('Cita creada');
      queryClient.invalidateQueries(['appointments']);
      queryClient.invalidateQueries(['appointment-stats']);
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || 'Error al crear cita'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => appointmentsApi.update(id, data),
    onSuccess: () => {
      toast.success('Cita actualizada');
      queryClient.invalidateQueries(['appointments']);
      queryClient.invalidateQueries(['appointment-stats']);
    },
    onError: () => toast.error('Error al actualizar'),
  });

  const prevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const nextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const goToday = () => setSelectedDate(new Date());

  const openModal = () => {
    setFormData({
      clientName: '',
      clientPhone: '',
      serviceName: '',
      date: dateStr,
      timeSlot: '',
      duration: 60,
      agreedPrice: '',
      notes: ''
    });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      agreedPrice: formData.agreedPrice ? parseFloat(formData.agreedPrice) : null
    });
  };

  const updateStatus = (id, status) => {
    updateMutation.mutate({ id, data: { status } });
  };

  const getStatusColor = (status) => {
    const config = STATUS_CONFIG[status];
    return config?.color === 'blue'
      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      : config?.color === 'cyan'
        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
        : config?.color === 'amber'
          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
          : config?.color === 'green'
            ? 'bg-green-500/20 text-green-400 border-green-500/30'
            : config?.color === 'red'
              ? 'bg-red-500/20 text-red-400 border-red-500/30'
              : 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const isToday = dateStr === new Date().toISOString().split('T')[0];

  // Generate time slots
  const timeSlots = [];
  for (let h = 7; h <= 20; h++) {
    timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Agenda de Citas</h1>
            <p className="text-gray-400 text-sm">{stats.todayCount || 0} citas hoy</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nueva Cita</span>
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-dark-100/60 backdrop-blur-sm rounded-xl border border-white/5 p-4">
          <p className="text-2xl font-bold text-white">{stats.todayCount || 0}</p>
          <p className="text-xs text-gray-400">Hoy</p>
        </div>
        <div className="bg-dark-100/60 backdrop-blur-sm rounded-xl border border-white/5 p-4">
          <p className="text-2xl font-bold text-white">{stats.weekCount || 0}</p>
          <p className="text-xs text-gray-400">Esta semana</p>
        </div>
        <div className="bg-dark-100/60 backdrop-blur-sm rounded-xl border border-white/5 p-4">
          <p className="text-2xl font-bold text-blue-400">{stats.pendingCount || 0}</p>
          <p className="text-xs text-gray-400">Pendientes</p>
        </div>
        <div className="bg-dark-100/60 backdrop-blur-sm rounded-xl border border-white/5 p-4">
          <p className="text-2xl font-bold text-green-400">{stats.completedCount || 0}</p>
          <p className="text-xs text-gray-400">Completadas</p>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-dark-100/60 backdrop-blur-sm rounded-xl border border-white/5 p-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={prevDay}
          className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        <div className="text-center">
          <p className="text-lg font-semibold text-white">
            {selectedDate.toLocaleDateString('es-HN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          {!isToday && (
            <button onClick={goToday} className="text-xs text-primary-400 hover:text-primary-300">
              Ir a hoy
            </button>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={nextDay}
          className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Appointments List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-dark-100/60 backdrop-blur-sm rounded-xl border border-white/5 p-4">
              <div className="h-5 w-24 bg-dark-200 animate-pulse rounded mb-2" />
              <div className="h-4 w-48 bg-dark-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      ) : appointments.length > 0 ? (
        <div className="space-y-3">
          {appointments.map((apt, index) => {
            const StatusIcon = STATUS_CONFIG[apt.status]?.icon || Calendar;
            return (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-dark-100/60 backdrop-blur-sm rounded-xl border border-white/5 p-4 hover:border-white/10 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="text-center w-16 flex-shrink-0">
                      <p className="text-xl font-bold text-primary-400">{apt.timeSlot}</p>
                      <p className="text-xs text-gray-500">{apt.duration} min</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{apt.serviceName}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                        <User className="w-4 h-4" />
                        {apt.clientName}
                      </div>
                      {apt.clientPhone && (
                        <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-500">
                          <Phone className="w-4 h-4" />
                          {apt.clientPhone}
                        </div>
                      )}
                      {apt.agreedPrice && (
                        <p className="text-sm text-green-400 mt-1">L {apt.agreedPrice}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(apt.status)}`}>
                      <StatusIcon className="w-3 h-3" />
                      {STATUS_CONFIG[apt.status]?.label}
                    </span>

                    {/* Quick actions based on status */}
                    <div className="flex gap-1">
                      {apt.status === 'SCHEDULED' && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateStatus(apt.id, 'CONFIRMED')}
                            className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                            title="Confirmar"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateStatus(apt.id, 'CANCELLED')}
                            className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                            title="Cancelar"
                          >
                            <XCircle className="w-4 h-4" />
                          </motion.button>
                        </>
                      )}
                      {apt.status === 'CONFIRMED' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateStatus(apt.id, 'IN_PROGRESS')}
                          className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                          title="Iniciar"
                        >
                          <PlayCircle className="w-4 h-4" />
                        </motion.button>
                      )}
                      {apt.status === 'IN_PROGRESS' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateStatus(apt.id, 'COMPLETED')}
                          className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                          title="Completar"
                        >
                          <Check className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>

                {apt.notes && (
                  <p className="text-sm text-gray-500 mt-3 pl-20">{apt.notes}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Sin citas para este día</h2>
          <p className="text-gray-400 mb-6">Agenda una nueva cita</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openModal}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Cita
          </motion.button>
        </motion.div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100]"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-dark-100 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto sm:m-4 border border-white/10"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-white/5 flex items-center justify-between sticky top-0 bg-dark-100 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Nueva Cita</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeModal}
                  className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Client Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre del cliente *
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="Nombre completo"
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                    required
                  />
                </div>

                {/* Client Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    placeholder="9999-9999"
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                  />
                </div>

                {/* Service Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Servicio *
                  </label>
                  <input
                    type="text"
                    value={formData.serviceName}
                    onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                    placeholder="Ej: Corte de cabello, Reparación..."
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                    required
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Fecha *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Hora *
                    </label>
                    <select
                      value={formData.timeSlot}
                      onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all appearance-none cursor-pointer"
                      required
                    >
                      <option value="">Seleccionar</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Duration & Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Duración (min)
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all appearance-none cursor-pointer"
                    >
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>1 hora</option>
                      <option value={90}>1.5 horas</option>
                      <option value={120}>2 horas</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Precio (L)
                    </label>
                    <input
                      type="number"
                      value={formData.agreedPrice}
                      onChange={(e) => setFormData({ ...formData, agreedPrice: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notas
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notas adicionales..."
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all min-h-[80px] resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 bg-dark-200/50 hover:bg-dark-200 border border-white/5 text-white rounded-xl font-medium transition-colors"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                  >
                    {createMutation.isPending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Agendar
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageAppointments;
