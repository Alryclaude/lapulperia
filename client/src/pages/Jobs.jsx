import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, MapPin, Clock, ChevronRight, Search, Filter } from 'lucide-react';
import { jobApi } from '../services/api';

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', search],
    queryFn: () => jobApi.getAll({ search }),
  });

  const jobs = data?.data?.jobs || [];

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ q: search });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="card p-4">
            <div className="skeleton h-6 w-3/4 mb-2" />
            <div className="skeleton h-4 w-1/2 mb-4" />
            <div className="skeleton h-4 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Empleos</h1>
        <p className="text-gray-500 mt-1">Encuentra oportunidades en pulperias cercanas</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar empleos..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        />
      </form>

      {/* Jobs List */}
      {jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Link
              key={job.id}
              to={`/job/${job.id}`}
              className="card p-5 block hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-gray-500">
                    <span className="font-medium text-primary-600">{job.pulperia.name}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>

              <p className="text-gray-600 mt-3 line-clamp-2">{job.description}</p>

              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                {job.salary && (
                  <span className="font-medium text-green-600">{job.salary}</span>
                )}
                {job.type && (
                  <span className="badge-gray">{job.type}</span>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(job.createdAt).toLocaleDateString('es-HN')}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No hay empleos disponibles</h2>
          <p className="text-gray-500">Vuelve pronto para nuevas oportunidades</p>
        </div>
      )}
    </div>
  );
};

export default Jobs;
