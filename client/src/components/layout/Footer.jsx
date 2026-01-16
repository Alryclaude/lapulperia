import { motion } from 'framer-motion';
import { Heart, MapPin, Store, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '../Logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-400 border-t border-dark-50/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <Logo size="sm" showText={true} />
            <p className="text-sm text-gray-400 max-w-xs">
              Conectando pulperías hondureñas con sus comunidades. Tu tienda de barrio, ahora digital.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">
              Navegación
            </h3>
            <nav className="flex flex-col space-y-2">
              <Link
                to="/"
                className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
              >
                Inicio
              </Link>
              <Link
                to="/search"
                className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
              >
                Buscar productos
              </Link>
              <Link
                to="/map"
                className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
              >
                Mapa de pulperías
              </Link>
            </nav>
          </div>

          {/* Para Pulperías */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">
              Para Pulperías
            </h3>
            <nav className="flex flex-col space-y-2">
              <Link
                to="/auth"
                className="text-sm text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-2"
              >
                <Store className="w-4 h-4" />
                Registra tu pulpería
              </Link>
              <a
                href="mailto:soporte@lapulperiastore.net"
                className="text-sm text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Contacto
              </a>
            </nav>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dark-50/30 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-xs text-gray-500">
              © {currentYear} La Pulperia. Hecho con{' '}
              <motion.span
                className="inline-block text-primary-500"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
              >
                <Heart className="w-3 h-3 inline fill-current" />
              </motion.span>
              {' '}en Honduras.
            </p>

            {/* Location badge */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              <span>Tegucigalpa, Honduras</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
