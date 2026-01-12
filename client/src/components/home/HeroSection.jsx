import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Briefcase, Sparkles } from 'lucide-react';
import { LogoIcon } from '../Logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const HeroSection = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-dark-100 via-dark-200 to-dark-100 border border-white/5 text-white p-8 md:p-12"
    >
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex-shrink-0"
        >
          <LogoIcon size={120} />
        </motion.div>

        {/* Content */}
        <div className="flex-1 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Badge className="mb-4 bg-accent-500/20 text-accent-300 border-accent-500/30">
              <Sparkles className="w-3 h-3" />
              Tu tienda de barrio
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
          >
            <span className="text-white">La </span>
            <span className="text-primary-500">Pulperia</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 text-lg mb-6 max-w-lg"
          >
            ¿Que deseaba? Encuentra productos, compara precios y apoya a los negocios de tu comunidad
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-3 justify-center md:justify-start"
          >
            <Button asChild size="lg" className="shadow-primary">
              <Link to="/search">
                <Search className="w-5 h-5" />
                Buscar Productos
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              size="lg"
            >
              <Link to="/jobs">
                <Briefcase className="w-5 h-5" />
                Ver Empleos
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/10 rounded-full blur-2xl" />
    </motion.section>
  );
};

export default HeroSection;
