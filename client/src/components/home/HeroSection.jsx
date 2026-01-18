import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Store, Sparkles, MapPin, ShoppingBag } from 'lucide-react';
import { LogoIcon } from '../Logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * HeroSection - Constelacion de Barrio Design System
 *
 * Hero con efecto de constelación - las estrellas representan pulperías
 */
const HeroSection = ({ pulperiasCount = 0, productsCount = 0 }) => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-3xl overflow-hidden border border-white/[0.06] text-white p-6 md:p-10 lg:p-12"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface-1 via-surface-2 to-surface-1" />

      {/* Constellation stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: i % 3 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 3 : 2,
              left: `${5 + Math.random() * 90}%`,
              top: `${5 + Math.random() * 90}%`,
              backgroundColor: i % 4 === 0 ? '#FA5252' : i % 3 === 0 ? '#FBBF24' : '#FFFFFF',
            }}
            animate={{
              opacity: [0.15, 0.6, 0.15],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 2.5 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Gradient orbs */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-accent-500/10 rounded-full blur-2xl" />
      <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-cyan-500/5 rounded-full blur-2xl" />

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
        {/* Logo with glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex-shrink-0 relative"
        >
          <LogoIcon size={120} />
          <div className="absolute inset-0 blur-3xl opacity-25 bg-primary-500 rounded-full -z-10" />
        </motion.div>

        {/* Text content */}
        <div className="flex-1 text-center md:text-left">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Badge className="mb-4 bg-accent-500/15 text-accent-400 border-accent-500/30">
              <Sparkles className="w-3 h-3" />
              Tu tienda de barrio, ahora digital
            </Badge>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
          >
            <span className="text-white">Tu barrio, </span>
            <span className="text-gradient">a un toque</span>
            <br className="hidden sm:block" />
            <span className="text-white"> de distancia</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 text-base md:text-lg mb-6 max-w-lg"
          >
            Encuentra productos, compara precios y apoya a los negocios locales.
            Recibe tus pedidos en minutos.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-3 justify-center md:justify-start mb-6"
          >
            <Button asChild size="lg">
              <Link to="/search">
                <Search className="w-5 h-5" />
                Explorar negocios
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to="/register">
                <Store className="w-5 h-5" />
                Registra tu negocio
              </Link>
            </Button>
          </motion.div>

          {/* Stats badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap gap-3 justify-center md:justify-start"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-2/60 border border-white/[0.06]">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-gray-300">
                <span className="font-semibold text-white">
                  {pulperiasCount > 0 ? `${pulperiasCount}+` : '50+'}
                </span>{' '}
                negocios
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-2/60 border border-white/[0.06]">
              <ShoppingBag className="w-4 h-4 text-accent-400" />
              <span className="text-sm text-gray-300">
                <span className="font-semibold text-white">
                  {productsCount > 0 ? `${productsCount}+` : '1,000+'}
                </span>{' '}
                productos
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default HeroSection;
