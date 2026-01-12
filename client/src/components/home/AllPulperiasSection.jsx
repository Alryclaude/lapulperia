import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SkeletonPulperiaCard, AnimatedList, AnimatedListItem } from '@/components/ui';
import PulperiaCard from '../common/PulperiaCard';

const AllPulperiasSection = ({ pulperias, isLoading }) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-dark-50 rounded-lg">
            <Store className="w-4 h-4 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Pulperias cerca</h2>
        </div>
        <Link
          to="/search"
          className="text-primary-400 text-sm font-medium hover:text-primary-300 flex items-center gap-1 transition-colors"
        >
          Ver todas
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <SkeletonPulperiaCard key={i} />
          ))}
        </div>
      ) : pulperias.length > 0 ? (
        <AnimatedList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pulperias.map((pulperia) => (
            <AnimatedListItem key={pulperia.id}>
              <PulperiaCard pulperia={pulperia} />
            </AnimatedListItem>
          ))}
        </AnimatedList>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-dark-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-gray-400">
            No hay pulperias cerca de tu ubicacion
          </p>
          <Button asChild variant="secondary" className="mt-4">
            <Link to="/search">Buscar en otra zona</Link>
          </Button>
        </motion.div>
      )}
    </section>
  );
};

export default AllPulperiasSection;
