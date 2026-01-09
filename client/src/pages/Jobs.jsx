import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Briefcase, Clock, ChevronRight, Search } from 'lucide-react';
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
          <div key={i} className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5">
            <div className="h-6 w-3/4 bg-dark-200 animate-pulse rounded mb-2" />
            <div className="h-4 w-1/2 bg-dark-200 animate-pulse rounded mb-4" />
            <div className="h-4 w-1/3 bg-dark-200 animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
          <Briefcase className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Empleos</h1>
          <p className="text-gray-400 text-sm">Encuentra oportunidades en pulperias cercanas</p>
        </div>
      </motion.div>

      {/* Search */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSearch}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar empleos..."
          className="w-full pl-12 pr-4 py-3 bg-dark-100/60 backdrop-blur-sm border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
        />
      </motion.form>

      {/* Jobs List */}
      {jobs.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/job/${job.id}`}
                className="block bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5 hover:border-white/10 hover:bg-dark-100/80 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg group-hover:text-primary-400 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-medium text-primary-400">{job.pulperia.name}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0 group-hover:text-primary-400 transition-colors" />
                </div>

                <p className="text-gray-400 mt-3 line-clamp-2">{job.description}</p>

                <div className="flex flex-wrap items-center gap-3 mt-4 text-sm">
                  {job.salary && (
                    <span className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 font-medium border border-green-500/30">
                      {job.salary}
                    </span>
                  )}
                  {job.type && (
                    <span className="px-3 py-1 rounded-lg bg-dark-200/80 text-gray-300 border border-white/5">
                      {job.type}
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Clock className="w-4 h-4" />
                    {new Date(job.createdAt).toLocaleDateString('es-HN')}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-500/20 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-primary-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No hay empleos disponibles</h2>
          <p className="text-gray-400">Vuelve pronto para nuevas oportunidades</p>
        </motion.div>
      )}
    </div>
  );
};

export default Jobs;
