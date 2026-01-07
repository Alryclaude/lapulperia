import { NavLink } from 'react-router-dom';
import {
  Home,
  Search,
  Briefcase,
  User,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  Wrench,
} from 'lucide-react';

const BottomNav = ({ isPulperia = false }) => {
  const clientLinks = [
    { to: '/', icon: Home, label: 'Inicio' },
    { to: '/search', icon: Search, label: 'Buscar' },
    { to: '/jobs', icon: Briefcase, label: 'Empleos' },
    { to: '/services', icon: Wrench, label: 'Servicios' },
    { to: '/profile', icon: User, label: 'Perfil' },
  ];

  const pulperiaLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Panel' },
    { to: '/manage/orders', icon: ShoppingBag, label: 'Ordenes' },
    { to: '/manage/products', icon: Package, label: 'Productos' },
    { to: '/manage/jobs', icon: Briefcase, label: 'Empleos' },
    { to: '/pulperia/settings', icon: Settings, label: 'Config' },
  ];

  const links = isPulperia ? pulperiaLinks : clientLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-gray-200/50 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className="text-xs font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
