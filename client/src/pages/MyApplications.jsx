import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { jobApi } from '../services/api';

// Status con tema oscuro - Vibrancia de Barrio
const statusConfig = {
  PENDING: {
    label: 'Pendiente',
    icon: Clock,
    color: 'text-amber-400 bg-amber-500/20',
  },
  REVIEWING: {
    label: 'En revisión',
    icon: AlertCircle,
    color: 'text-blue-400 bg-blue-500/20',
  },
  ACCEPTED: {
    label: 'Aceptada',
    icon: CheckCircle,
    color: 'text-emerald-400 bg-emerald-500/20',
  },
  REJECTED: {
    label: 'Rechazada',
    icon: XCircle,
    color: 'text-red-400 bg-red-500/20',
  },
};

const MyApplications = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => jobApi.getMyApplications(),
  });

  const applications = data?.data?.applications || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card p-4">
            <div className="skeleton h-6 w-2/3 mb-2" />
            <div className="skeleton h-4 w-1/3 mb-3" />
            <div className="skeleton h-4 w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Aplicaciones</h1>
        <p className="text-gray-500 mt-1">Empleos a los que has aplicado</p>
      </div>

      {applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app) => {
            const status = statusConfig[app.status] || statusConfig.PENDING;
            const StatusIcon = status.icon;

            return (
              <div key={app.id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      to={`/job/${app.job?.id}`}
                      className="font-semibold text-gray-900 hover:text-primary-600"
                    >
                      {app.job?.title || 'Empleo'}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      {app.job?.pulperia?.name || 'Pulpería'}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Aplicado el {new Date(app.createdAt).toLocaleDateString('es-HN')}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${status.color}`}>
                    <StatusIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{status.label}</span>
                  </div>
                </div>
                {app.coverLetter && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600 line-clamp-2">{app.coverLetter}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sin aplicaciones</h2>
          <p className="text-gray-500 mb-6">
            Explora las ofertas de empleo disponibles en pulperías cercanas.
          </p>
          <Link to="/jobs" className="btn-primary">
            Ver Empleos
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
