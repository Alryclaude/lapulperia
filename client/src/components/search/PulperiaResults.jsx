import { Store } from 'lucide-react';
import PulperiaCard from '../common/PulperiaCard';
import { SkeletonPulperiaCard, AnimatedList, AnimatedListItem } from '@/components/ui';
import EmptyState from './EmptyState';

const PulperiaResults = ({ pulperias, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <SkeletonPulperiaCard key={i} />
        ))}
      </div>
    );
  }

  if (pulperias.length > 0) {
    return (
      <AnimatedList className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pulperias.map((pulperia) => (
          <AnimatedListItem key={pulperia.id}>
            <PulperiaCard pulperia={pulperia} />
          </AnimatedListItem>
        ))}
      </AnimatedList>
    );
  }

  return (
    <EmptyState
      icon={Store}
      title="No hay pulperias cerca"
      description="Intenta ampliar tu rango de busqueda"
    />
  );
};

export default PulperiaResults;
