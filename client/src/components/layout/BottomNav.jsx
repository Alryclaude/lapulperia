import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Search,
  Briefcase,
  User,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  Megaphone,
} from 'lucide-react';

// REVAMP: Enhanced BottomNav with vibrant active states
const BottomNav = ({ isPulperia = false }) => {
  const clientLinks = [
    { to: '/', icon: Home, label: 'Inicio', color: 'primary' },
    { to: '/search', icon: Search, label: 'Buscar', color: 'cyan' },
    { to: '/announcements', icon: Megaphone, label: 'Anuncios', color: 'orange' },
    { to: '/chambas', icon: Briefcase, label: 'Chambas', color: 'purple' },
    { to: '/profile', icon: User, label: 'Perfil', color: 'accent' },
  ];

  const pulperiaLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Panel', color: 'primary' },
    { to: '/manage/orders', icon: ShoppingBag, label: 'Órdenes', color: 'green' },
    { to: '/manage/products', icon: Package, label: 'Productos', color: 'cyan' },
    { to: '/manage/announcements', icon: Megaphone, label: 'Anuncios', color: 'orange' },
    { to: '/pulperia/settings', icon: Settings, label: 'Config', color: 'gray' },
  ];

  const links = isPulperia ? pulperiaLinks : clientLinks;

  // Color mappings for active states
  const colorMap = {
    primary: {
      text: 'text-primary-400',
      bg: 'bg-primary-500/20',
      glow: 'shadow-[0_0_12px_rgba(220,38,38,0.4)]',
    },
    cyan: {
      text: 'text-cyan-400',
      bg: 'bg-cyan-500/20',
      glow: 'shadow-[0_0_12px_rgba(6,182,212,0.4)]',
    },
    purple: {
      text: 'text-purple-400',
      bg: 'bg-purple-500/20',
      glow: 'shadow-[0_0_12px_rgba(139,92,246,0.4)]',
    },
    lime: {
      text: 'text-lime-400',
      bg: 'bg-lime-500/20',
      glow: 'shadow-[0_0_12px_rgba(132,204,22,0.4)]',
    },
    orange: {
      text: 'text-orange-400',
      bg: 'bg-orange-500/20',
      glow: 'shadow-[0_0_12px_rgba(249,115,22,0.4)]',
    },
    accent: {
      text: 'text-accent-400',
      bg: 'bg-accent-500/20',
      glow: 'shadow-[0_0_12px_rgba(251,191,36,0.4)]',
    },
    green: {
      text: 'text-green-400',
      bg: 'bg-green-500/20',
      glow: 'shadow-[0_0_12px_rgba(34,197,94,0.4)]',
    },
    gray: {
      text: 'text-gray-300',
      bg: 'bg-gray-500/20',
      glow: '',
    },
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-dark-400/90 backdrop-blur-xl border-t border-white/[0.08] pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {links.map(({ to, icon: Icon, label, color }) => {
          const colors = colorMap[color] || colorMap.primary;

          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/' || to === '/dashboard'}
              className="flex flex-col items-center justify-center flex-1 py-1"
            >
              {({ isActive }) => (
                <motion.div
                  className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200"
                  initial={false}
                  whileTap={{ scale: 0.92 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  {/* Icon container with glow effect */}
                  <div
                    className={`relative p-2 rounded-xl transition-all duration-300 ${
                      isActive
                        ? `${colors.bg} ${colors.glow}`
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-all duration-200 ${
                        isActive
                          ? `${colors.text} stroke-[2.5]`
                          : 'text-gray-500'
                      }`}
                    />
                    {/* Active indicator dot */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${colors.bg.replace('/20', '')}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[10px] font-medium transition-colors duration-200 ${
                      isActive ? colors.text : 'text-gray-500'
                    }`}
                  >
                    {label}
                  </span>
                </motion.div>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
