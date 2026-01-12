import { motion } from 'framer-motion';
import { Package, Search as SearchIcon } from 'lucide-react';
import ProductCard from '../products/ProductCard';
import { SkeletonProductCard, AnimatedList, AnimatedListItem } from '@/components/ui';
import EmptyState from './EmptyState';

const ProductResults = ({ products, isLoading, query, gridView }) => {
  const gridClasses = gridView
    ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
    : 'grid-cols-1';

  if (isLoading) {
    return (
      <div className={`grid gap-4 ${gridClasses}`}>
        {[...Array(8)].map((_, i) => (
          <SkeletonProductCard key={i} />
        ))}
      </div>
    );
  }

  if (products.length > 0) {
    return (
      <AnimatedList className={`grid gap-4 ${gridClasses}`}>
        {products.map((product) => (
          <AnimatedListItem key={product.id}>
            <ProductCard
              product={product}
              pulperia={product.pulperia}
              showPulperia
            />
          </AnimatedListItem>
        ))}
      </AnimatedList>
    );
  }

  if (query) {
    return (
      <EmptyState
        icon={Package}
        title={`No se encontraron productos para "${query}"`}
        description="Intenta con otros terminos o revisa la ortografia"
      />
    );
  }

  return (
    <EmptyState
      icon={SearchIcon}
      title="Busca productos cerca de ti"
      description="Escribe el nombre de un producto para comenzar"
    />
  );
};

export default ProductResults;
