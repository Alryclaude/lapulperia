import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Briefcase, MapPin, Clock, Send, CheckCircle, Store } from 'lucide-react';
import { jobApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const JobDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuthStore();
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
      <div className="space-y-6">
        <div className="skeleton h-8 w-3/4" />
        <div className="skeleton h-6 w-1/2" />
        <div className="skeleton h-32 w-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Empleo no encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <Link to="/jobs" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-5 h-5" />
        Ver todos los empleos
      </Link>

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          {job.pulperia.logo ? (
            <img src={job.pulperia.logo} alt="" className="w-16 h-16 rounded-xl object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center">
              <Store className="w-8 h-8 text-primary-600" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <Link
              to={`/pulperia/${job.pulperia.id}`}
              className="text-primary-600 hover:underline font-medium"
            >
              {job.pulperia.name}
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          {job.salary && (
            <span className="badge bg-green-100 text-green-700">{job.salary}</span>
          )}
          {job.type && (
            <span className="badge-gray">{job.type}</span>
          )}
          <span className="badge-gray flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {new Date(job.createdAt).toLocaleDateString('es-HN')}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-3">Descripcion del puesto</h2>
        <p className="text-gray-600 whitespace-pre-line">{job.description}</p>
      </div>

      {/* Requirements */}
      {job.requirements && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Requisitos</h2>
          <p className="text-gray-600 whitespace-pre-line">{job.requirements}</p>
        </div>
      )}

      {/* Location */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-3">Ubicacion</h2>
        <div className="flex items-start gap-2 text-gray-600">
          <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p>{job.pulperia.address}</p>
            {job.pulperia.reference && (
              <p className="text-sm text-gray-500 mt-1">{job.pulperia.reference}</p>
            )}
          </div>
        </div>
      </div>

      {/* Apply Section */}
      <div className="card p-6">
        {!isAuthenticated ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">Inicia sesion para aplicar a este empleo</p>
            <Link to="/login" className="btn-primary">
              Iniciar Sesion
            </Link>
          </div>
        ) : hasApplied ? (
          <div className="flex items-center gap-3 text-green-600">
            <CheckCircle className="w-6 h-6" />
            <span className="font-medium">Ya aplicaste a este empleo</span>
          </div>
        ) : showForm ? (
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje (opcional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Cuentale al empleador por que eres ideal para este puesto..."
                className="input min-h-[120px]"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={applyMutation.isPending}
                className="btn-primary flex-1"
              >
                {applyMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar Aplicacion
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <button onClick={() => setShowForm(true)} className="btn-primary w-full">
            <Briefcase className="w-5 h-5" />
            Aplicar a este empleo
          </button>
        )}
      </div>
    </div>
  );
};

export default JobDetail;
