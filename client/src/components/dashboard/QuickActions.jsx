import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Users, Target, ArrowRight, Wrench, Tag } from 'lucide-react';

// REVAMP: Enhanced QuickActions with vibrant gradients
const QuickActions = () => {
  const actions = [
    {
      to: '/manage/orders',
      icon: ShoppingBag,
      title: 'Ordenes',
      description: 'Gestiona tus pedidos',
      color: 'primary',
      gradient: 'from-primary-500/20 to-primary-600/10',
      iconBg: 'from-primary-500/30 to-primary-600/20',
      hoverBorder: 'hover:border-primary-500/40',
      textColor: 'text-primary-400',
      glow: 'shadow-[0_0_20px_rgba(220,38,38,0.15)]',
    },
    {
      to: '/manage/products',
      icon: Package,
      title: 'Productos',
      description: 'Agrega y edita',
      color: 'cyan',
      gradient: 'from-cyan-500/20 to-cyan-600/10',
      iconBg: 'from-cyan-500/30 to-cyan-600/20',
      hoverBorder: 'hover:border-cyan-500/40',
      textColor: 'text-cyan-400',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    },
    {
      to: '/manage/jobs',
      icon: Users,
      title: 'Empleos',
      description: 'Publica vacantes',
      color: 'purple',
      gradient: 'from-purple-500/20 to-purple-600/10',
      iconBg: 'from-purple-500/30 to-purple-600/20',
      hoverBorder: 'hover:border-purple-500/40',
      textColor: 'text-purple-400',
      glow: 'shadow-[0_0_20px_rgba(139,92,246,0.15)]',
    },
    {
      to: '/manage/services',
      icon: Wrench,
      title: 'Servicios',
      description: 'Ofrece servicios',
      color: 'amber',
      gradient: 'from-amber-500/20 to-amber-600/10',
      iconBg: 'from-amber-500/30 to-amber-600/20',
      hoverBorder: 'hover:border-amber-500/40',
      textColor: 'text-amber-400',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    },
    {
      to: '/manage/promotions',
      icon: Tag,
      title: 'Promociones',
      description: 'Descuentos y ofertas',
      color: 'green',
      gradient: 'from-green-500/20 to-green-600/10',
      iconBg: 'from-green-500/30 to-green-600/20',
      hoverBorder: 'hover:border-green-500/40',
      textColor: 'text-green-400',
      glow: 'shadow-[0_0_20px_rgba(34,197,94,0.15)]',
    },
    {
      to: '/pulperia/settings',
      icon: Target,
      title: 'Perfil',
      description: 'Configura tu negocio',
      color: 'lime',
      gradient: 'from-lime-500/20 to-lime-600/10',
      iconBg: 'from-lime-500/30 to-lime-600/20',
      hoverBorder: 'hover:border-lime-500/40',
      textColor: 'text-lime-400',
      glow: 'shadow-[0_0_20px_rgba(132,204,22,0.15)]',
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white">Acciones Rápidas</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actions.map(({ to, icon: Icon, title, description, gradient, iconBg, hoverBorder, textColor, glow }, index) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              to={to}
              className={`relative block bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] p-5 ${hoverBorder} transition-all duration-300 group overflow-hidden`}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              {/* Content */}
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${glow}`}>
                  <Icon className={`w-6 h-6 ${textColor}`} />
                </div>
                <h3 className="font-semibold text-white group-hover:text-white transition-colors">{title}</h3>
                <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors mt-0.5">{description}</p>

                {/* Arrow indicator */}
                <div className={`absolute top-5 right-5 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 ${textColor}`}>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
