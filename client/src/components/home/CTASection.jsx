import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { LogoIcon } from '../Logo';
import { Button } from '@/components/ui/button';
import { FadeInView } from '@/components/ui';

const CTASection = ({ isAuthenticated }) => {
  if (isAuthenticated) return null;

  return (
    <FadeInView>
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900/50 via-dark-100 to-dark-200 border border-primary-500/20 text-white p-8 md:p-12">
        <div className="relative z-10 text-center max-w-xl mx-auto">
          <LogoIcon size={64} className="mx-auto mb-4" />
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            ¿Tienes una pulperia?
          </h3>
          <p className="text-gray-400 mb-8">
            Digitaliza tu negocio, recibe pedidos en tiempo real y haz crecer
            tu comunidad de clientes
          </p>
          <Button asChild size="lg">
            <Link to="/register">
              Registrar mi Pulperia
              <ChevronRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>

        {/* Decorative */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-accent-500/10 rounded-full blur-3xl" />
      </section>
    </FadeInView>
  );
};

export default CTASection;
