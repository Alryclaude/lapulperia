import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  Settings,
  Heart,
  Package,
  Store,
  LayoutDashboard,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { Logo } from '../Logo';

const Header = ({ isPulperia = false }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = getTotalItems();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isPulperia ? '/dashboard' : '/'} className="flex items-center gap-2">
            <Logo size="sm" showText={true} />
          </Link>

          {/* Search - Desktop */}
          {!isPulperia && (
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar productos, pulperias..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-100/80 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:bg-dark-100 focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
            </form>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search icon - Mobile */}
            {!isPulperia && (
              <Link
                to="/search"
                className="md:hidden p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <Search className="w-5 h-5" />
              </Link>
            )}

            {/* Cart */}
            {isAuthenticated && !isPulperia && (
              <Link
                to="/cart"
                className="relative p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-500 text-white text-xs font-medium rounded-full flex items-center justify-center shadow-glow-red">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-1.5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-500/50"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center ring-2 ring-primary-500/50">
                      <User className="w-4 h-4 text-primary-400" />
                    </div>
                  )}
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-dark-100 rounded-2xl shadow-xl border border-white/10 py-2 z-50 animate-scale-in">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="font-medium text-white truncate">{user.name}</p>
                        <p className="text-sm text-gray-400 truncate">{user.email}</p>
                      </div>

                      {user.role === 'PULPERIA' && !isPulperia && (
                        <Link
                          to="/dashboard"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <LayoutDashboard className="w-5 h-5" />
                          Centro de Comando
                        </Link>
                      )}

                      {user.role === 'PULPERIA' && isPulperia && (
                        <Link
                          to="/"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <Store className="w-5 h-5" />
                          Ver Marketplace
                        </Link>
                      )}

                      <Link
                        to="/orders"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <Package className="w-5 h-5" />
                        Mis Pedidos
                      </Link>

                      <Link
                        to="/favorites"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <Heart className="w-5 h-5" />
                        Favoritos
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <Settings className="w-5 h-5" />
                        Configuracion
                      </Link>

                      <div className="border-t border-white/10 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full"
                        >
                          <LogOut className="w-5 h-5" />
                          Cerrar Sesion
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary btn-sm">
                Iniciar Sesion
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
