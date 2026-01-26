import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, MapPin, Clock, Send, CheckCircle, Store } from 'lucide-react';
import { jobApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const JobDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobApi.getById(id),
  });

  const job = data?.data?.job;
  const hasApplied = data?.data?.hasApplied;

  const applyMutation = useMutation({
    mutationFn: (data) => jobApi.apply(id, data),
    onSuccess: () => {
      toast.success('Aplicacion enviada exitosamente');
      setShowForm(false);
    },
    onError: () => {
      toast.error('Error al enviar aplicacion');
    },
  });

  const handleApply = (e) => {
    e.preventDefault();
    applyMutation.mutate({ message });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-dark-200 animate-pulse rounded" />
        <div className="bg-dark-100/60 rounded-2xl border border-white/5 p-6">
          <div className="h-6 w-3/4 bg-dark-200 animate-pulse rounded mb-4" />
          <div className="h-4 w-1/2 bg-dark-200 animate-pulse rounded mb-6" />
          <div className="h-32 w-full bg-dark-200 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-12 text-center">
        <Briefcase className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">Empleo no encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Link to="/jobs" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Ver todos los empleos
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-6"
      >
        <div className="flex items-start gap-4">
          {job.pulperia.logo ? (
            <img src={job.pulperia.logo} alt="" className="w-16 h-16 rounded-xl object-cover border border-white/10" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-primary-500/20 flex items-center justify-center border border-primary-500/30">
              <Store className="w-8 h-8 text-primary-400" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{job.title}</h1>
            <Link
              to={`/pulperia/${job.pulperia.id}`}
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              {job.pulperia.name}
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          {job.salary && (
            <span className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 font-medium border border-green-500/30">
              {job.salary}
            </span>
          )}
          {job.type && (
            <span className="px-3 py-1.5 rounded-lg bg-dark-200/80 text-gray-300 border border-white/5">
              {job.type}
            </span>
          )}
          <span className="px-3 py-1.5 rounded-lg bg-dark-200/80 text-gray-400 border border-white/5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {new Date(job.createdAt).toLocaleDateString('es-HN')}
          </span>
        </div>
      </motion.div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-6"
      >
        <h2 className="font-semibold text-white mb-3">Descripcion del puesto</h2>
        <p className="text-gray-400 whitespace-pre-line">{job.description}</p>
      </motion.div>

      {/* Requirements */}
      {job.requirements && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-6"
        >
          <h2 className="font-semibold text-white mb-3">Requisitos</h2>
          <p className="text-gray-400 whitespace-pre-line">{job.requirements}</p>
        </motion.div>
      )}

      {/* Location */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-6"
      >
        <h2 className="font-semibold text-white mb-3">Ubicacion</h2>
        <div className="flex items-start gap-2 text-gray-400">
          <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary-400" />
          <div>
            <p>{job.pulperia.address}</p>
            {job.pulperia.reference && (
              <p className="text-sm text-gray-500 mt-1">{job.pulperia.reference}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Apply Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-6"
      >
        {!isAuthenticated ? (
          <div className="text-center">
            <p className="text-gray-400 mb-4">Inicia sesion para aplicar a este empleo</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
            >
              Iniciar Sesion
            </Link>
          </div>
        ) : hasApplied ? (
          <div className="flex items-center justify-center gap-3 text-green-400 py-2">
            <CheckCircle className="w-6 h-6" />
            <span className="font-medium">Ya aplicaste a este empleo</span>
          </div>
        ) : showForm ? (
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mensaje (opcional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Cuentale al empleador por que eres ideal para este puesto..."
                className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all min-h-[120px] resize-none"
              />
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-3 bg-dark-200/50 hover:bg-dark-200 border border-white/5 text-white rounded-xl font-medium transition-colors"
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={applyMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
              >
                {applyMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar Aplicacion
                  </>
                )}
              </motion.button>
            </div>
          </form>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
          >
            <Briefcase className="w-5 h-5" />
            Aplicar a este empleo
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default JobDetail;
