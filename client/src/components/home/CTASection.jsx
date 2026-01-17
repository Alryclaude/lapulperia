import { Link } from 'react-router-dom';
import { Search, Store, ChevronRight, ShoppingBag, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FadeInView } from '@/components/ui';

const CTASection = ({ isAuthenticated }) => {
  if (isAuthenticated) return null;

  return (
    <FadeInView>
      <section className="py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Client CTA */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-900/30 via-dark-100 to-dark-200 border border-cyan-500/20 p-6 md:p-8 group hover:border-cyan-500/40 transition-all duration-300">
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/20 mb-4">
                <ShoppingBag className="w-6 h-6 text-cyan-400" />
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                ¿Quieres comprar?
              </h3>
              <p className="text-gray-400 mb-6">
                Explora productos de pulperías cerca de ti y recibe tus pedidos en minutos
              </p>

              <Button asChild size="lg" variant="secondary" className="group/btn">
                <Link to="/search">
                  <Search className="w-5 h-5" />
                  Explorar Pulperías
                  <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </Button>
            </div>

            {/* Decorative */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
          </div>

          {/* Owner CTA */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-900/30 via-dark-100 to-dark-200 border border-primary-500/20 p-6 md:p-8 group hover:border-primary-500/40 transition-all duration-300">
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-500/20 mb-4">
                <Store className="w-6 h-6 text-primary-400" />
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                ¿Tienes una pulpería?
              </h3>
              <p className="text-gray-400 mb-6">
                Digitaliza tu negocio gratis, recibe pedidos en tiempo real y aumenta tus ventas
              </p>

              <Button asChild size="lg" className="group/btn shadow-primary">
                <Link to="/register">
                  <TrendingUp className="w-5 h-5" />
                  Registrar mi Pulpería
                  <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </Button>
            </div>

            {/* Decorative */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent-500/5 rounded-full blur-2xl" />
          </div>
        </div>
      </section>
    </FadeInView>
  );
};

export default CTASection;
